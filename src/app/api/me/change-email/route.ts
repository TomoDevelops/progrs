import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/shared/config/auth/auth";
import { getDb } from "@/shared/db/database";
import { user } from "@/shared/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { ApiSuccessResponse, ApiErrorResponse } from "@/shared/types/api";

// Validation schema for email change
const changeEmailSchema = z.object({
  newEmail: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  const auth = getAuth();
  const db = getDb();
  
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
    const { newEmail } = changeEmailSchema.parse(body);

    // Check if new email is already in use
    const [existingUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, newEmail))
      .limit(1);

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Email Already Exists",
          details: "This email address is already associated with another account",
        } satisfies ApiErrorResponse,
        { status: 409 },
      );
    }

    // Use Better Auth's changeEmail method
    const result = await auth.api.changeEmail({
      body: {
        newEmail,
      },
      headers: request.headers,
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Email Change Failed",
          details: "Failed to initiate email change process",
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    const response: ApiSuccessResponse<{ requiresVerification: boolean }> = {
      success: true,
      data: { requiresVerification: true },
      message: "Email change initiated. Please check your new email for verification.",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/change-email POST:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: error.issues.map((issue) => issue.message).join(", "),
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