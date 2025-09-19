import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/shared/config/auth/auth";
import { z } from "zod";
import type { ApiErrorResponse } from "@/shared/types/api";
import { getEnv } from "@/shared/env";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required for account deletion"),
  confirmDeletion: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth();
    const env = getEnv();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "Unauthorized",
        details: "Please sign in to access this resource",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const body = await request.json();
    const validation = deleteAccountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { password, confirmDeletion } = validation.data;

    if (!confirmDeletion) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "Account deletion must be confirmed",
        details:
          "You must confirm account deletion by setting confirmDeletion to true",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Use Better Auth's built-in delete user endpoint with required password
    const deleteBody = {
      callbackUrl: `${env.APP_URL}/login`,
      password: password,
    };

    const response = await auth.api.deleteUser({
      body: deleteBody,
      headers: request.headers,
    });

    if (!response.success) {
      // Handle Better Auth error response
      return NextResponse.json(
        {
          error: "Failed to delete account",
          details:
            response.message || "Invalid password or authentication failed",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET endpoint to trigger delete account verification email
export async function GET(request: NextRequest) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Better Auth's built-in send delete verification endpoint
    const response = await fetch(
      `${process.env.BETTER_AUTH_URL}/send-delete-account-verification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify({
          callbackURL: `${process.env.BETTER_AUTH_URL}/delete-account-callback`,
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Verification email sent. Please check your email to confirm account deletion.",
    });
  } catch (error) {
    console.error("Delete verification email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
