import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/config/auth/auth";
import { db } from "@/shared/db/database";
import { workoutReminders } from "@/shared/db/schema/app-schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import type { ApiSuccessResponse, ApiErrorResponse } from "@/shared/types/api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Please sign in to access this resource",
        } satisfies ApiErrorResponse,
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          details: "Reminder ID is required",
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    // Delete the reminder
    const [deletedReminder] = await db
      .delete(workoutReminders)
      .where(
        and(
          eq(workoutReminders.id, id),
          eq(workoutReminders.userId, session.user.id),
        ),
      )
      .returning();

    if (!deletedReminder) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          details:
            "Reminder not found or you don't have permission to delete it",
        } satisfies ApiErrorResponse,
        { status: 404 },
      );
    }

    const response: ApiSuccessResponse<null> = {
      success: true,
      message: "Workout reminder deleted successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/reminders/[id] DELETE:", error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Internal Server Error",
      details:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
