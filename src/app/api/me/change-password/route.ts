import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/shared/config/auth/auth";
import { z } from "zod";
import type { ApiSuccessResponse, ApiErrorResponse } from "@/shared/types/api";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long"),
});

export async function POST(request: NextRequest) {
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
    const validatedData = changePasswordSchema.parse(body);

    // Use Better Auth's changePassword method
    const result = await auth.api.changePassword({
      body: {
        currentPassword: validatedData.currentPassword,
        newPassword: validatedData.newPassword,
      },
      headers: request.headers,
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          details: "Invalid current password or failed to change password",
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    const response: ApiSuccessResponse<null> = {
      success: true,
      data: null,
      message: "Password changed successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/change-password:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "Bad Request",
        details: error.issues.map((issue) => issue.message).join(", "),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Handle Better Auth errors
    if (error instanceof Error && error.message.includes("INVALID_PASSWORD")) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "Bad Request",
        details: "Current password is incorrect",
      };
      return NextResponse.json(errorResponse, { status: 400 });
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
