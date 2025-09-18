import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/config/auth/auth";
import { db } from "@/shared/db/database";
import { user } from "@/shared/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { profileUpdateSchema } from "@/features/settings/types";
import type { ApiSuccessResponse, ApiErrorResponse } from "@/shared/types/api";

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

    // Get user profile from database
    const [userProfile] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          details: "User profile not found",
        } satisfies ApiErrorResponse,
        { status: 404 },
      );
    }

    const response: ApiSuccessResponse<typeof userProfile> = {
      success: true,
      data: userProfile,
      message: "User profile retrieved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/profile GET:", error);

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
    const validatedData = profileUpdateSchema.parse(body);

    // Check if username is being updated and if it's already taken
    if (validatedData.username) {
      const [existingUser] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.username, validatedData.username))
        .limit(1);

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Conflict",
            details: "Username is already taken",
          } satisfies ApiErrorResponse,
          { status: 409 },
        );
      }
    }

    // Update user profile
    const [updatedUser] = await db
      .update(user)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          details: "User not found",
        } satisfies ApiErrorResponse,
        { status: 404 },
      );
    }

    const response: ApiSuccessResponse<typeof updatedUser> = {
      success: true,
      data: updatedUser,
      message: "User profile updated successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/profile PUT:", error);

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
