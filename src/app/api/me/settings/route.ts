import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/shared/config/auth/auth";
import { getDb } from "@/shared/db/database";
import { userSettings } from "@/shared/db/schema/app-schema";
import { eq } from "drizzle-orm";
import {
  userSettingsSchema,
  userSettingsUpdateSchema,
} from "@/features/settings/types";
import type { UserSettings } from "@/features/settings/types";
import type { ApiSuccessResponse, ApiErrorResponse } from "@/shared/types/api";

export async function GET(request: NextRequest) {
  const db = getDb();
  const auth = getAuth();
  try {
    // Get the session from better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Please sign in to access this resource",
        } satisfies ApiErrorResponse,
        { status: 401 },
      );
    }

    // Get user settings from database
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    // If no settings exist, return defaults
    const defaultSettings = userSettingsSchema.parse({});
    const userSettingsData = settings
      ? {
          ...defaultSettings,
          ...settings,
          barWeight: parseFloat(settings.barWeight as string),
          roundingIncrement: parseFloat(settings.roundingIncrement as string),
          autoProgressionStep: parseFloat(
            settings.autoProgressionStep as string,
          ),
          quickStartDefaultSplit: settings.quickStartDefaultSplit || undefined,
          language: settings.language || undefined,
          platePairs: settings.platePairs
            ? JSON.parse(settings.platePairs as string)
            : defaultSettings.platePairs,
        }
      : defaultSettings;

    const response: ApiSuccessResponse<UserSettings> = {
      success: true,
      data: userSettingsData,
      message: "User settings retrieved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/settings GET:", error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Internal Server Error",
      details:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const auth = getAuth();
  try {
    // Get the session from better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Please sign in to access this resource",
        } satisfies ApiErrorResponse,
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = userSettingsUpdateSchema.parse(body);

    // Prepare data for database (serialize platePairs and convert numbers to strings)
    const dbData = {
      ...validatedData,
      barWeight: validatedData.barWeight?.toString(),
      roundingIncrement: validatedData.roundingIncrement?.toString(),
      autoProgressionStep: validatedData.autoProgressionStep?.toString(),
      platePairs: validatedData.platePairs
        ? JSON.stringify(validatedData.platePairs)
        : undefined,
      updatedAt: new Date(),
    };

    // Check if settings exist
    const [existingSettings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    let updatedSettings;
    if (existingSettings) {
      // Update existing settings
      [updatedSettings] = await db
        .update(userSettings)
        .set(dbData)
        .where(eq(userSettings.userId, session.user.id))
        .returning();
    } else {
      // Create new settings
      [updatedSettings] = await db
        .insert(userSettings)
        .values({
          userId: session.user.id,
          ...dbData,
        })
        .returning();
    }

    // Parse the response data
    const responseData = {
      ...updatedSettings,
      barWeight: parseFloat(updatedSettings.barWeight as string),
      roundingIncrement: parseFloat(
        updatedSettings.roundingIncrement as string,
      ),
      autoProgressionStep: parseFloat(
        updatedSettings.autoProgressionStep as string,
      ),
      quickStartDefaultSplit:
        updatedSettings.quickStartDefaultSplit || undefined,
      language: updatedSettings.language || undefined,
      platePairs: updatedSettings.platePairs
        ? JSON.parse(updatedSettings.platePairs as string)
        : null,
    };

    const response: ApiSuccessResponse<UserSettings> = {
      success: true,
      data: responseData as UserSettings,
      message: "User settings updated successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/settings PUT:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: error.message,
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Internal Server Error",
      details:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
