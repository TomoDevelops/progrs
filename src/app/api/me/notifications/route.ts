import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/config/auth/auth";
import { db } from "@/shared/db/database";
import { notificationPreferences } from "@/shared/db/schema/app-schema";
import { eq } from "drizzle-orm";
import { notificationPreferencesSchema, notificationPreferencesUpdateSchema } from "@/features/settings/types";
import type { NotificationPreferences, NotificationPreferencesUpdate } from "@/features/settings/types";

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiErrorResponse = {
  success: false;
  error: string;
  details?: string;
};

export async function GET(request: NextRequest) {
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

    // Get notification preferences from database
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, session.user.id))
      .limit(1);

    // If no preferences exist, return defaults
    const defaultPreferences = notificationPreferencesSchema.parse({});
    const userPreferences = preferences ? {
      ...defaultPreferences,
      ...preferences,
    } : defaultPreferences;

    const response: ApiSuccessResponse<NotificationPreferences> = {
      success: true,
      data: userPreferences,
      message: "Notification preferences retrieved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/notifications GET:", error);

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
    const validatedData = notificationPreferencesUpdateSchema.parse(body);

    // Prepare data for database
    const dbData = {
      ...validatedData,
      updatedAt: new Date(),
    };

    // Check if preferences exist
    const [existingPreferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, session.user.id))
      .limit(1);

    let updatedPreferences;
    if (existingPreferences) {
      // Update existing preferences
      [updatedPreferences] = await db
        .update(notificationPreferences)
        .set(dbData)
        .where(eq(notificationPreferences.userId, session.user.id))
        .returning();
    } else {
      // Create new preferences
      [updatedPreferences] = await db
        .insert(notificationPreferences)
        .values({
          userId: session.user.id,
          ...dbData,
        })
        .returning();
    }

    const response: ApiSuccessResponse<NotificationPreferences> = {
      success: true,
      data: updatedPreferences as NotificationPreferences,
      message: "Notification preferences updated successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/notifications PUT:", error);

    if (error instanceof Error && error.name === 'ZodError') {
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