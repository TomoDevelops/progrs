import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/config/auth/auth";
import { db } from "@/shared/db/database";
import { workoutReminders } from "@/shared/db/schema/app-schema";
import { eq, and } from "drizzle-orm";
import {
  createWorkoutReminderSchema,
  updateWorkoutReminderSchema,
} from "@/features/settings/types";
import type { WorkoutReminder } from "@/features/settings/types";
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

    // Get all reminders for the user
    const reminders = await db
      .select()
      .from(workoutReminders)
      .where(eq(workoutReminders.userId, session.user.id))
      .orderBy(workoutReminders.dayOfWeek, workoutReminders.timeLocal);

    const response: ApiSuccessResponse<WorkoutReminder[]> = {
      success: true,
      data: reminders as WorkoutReminder[],
      message: "Workout reminders retrieved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/reminders GET:", error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Internal Server Error",
      details:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = createWorkoutReminderSchema.parse(body);

    // Create new reminder
    const [newReminder] = await db
      .insert(workoutReminders)
      .values({
        userId: session.user.id,
        ...validatedData,
      })
      .returning();

    const response: ApiSuccessResponse<WorkoutReminder> = {
      success: true,
      data: newReminder as WorkoutReminder,
      message: "Workout reminder created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error in /api/me/reminders POST:", error);

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
    const validatedData = updateWorkoutReminderSchema.parse(body);

    // Update reminder
    const [updatedReminder] = await db
      .update(workoutReminders)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workoutReminders.id, validatedData.id),
          eq(workoutReminders.userId, session.user.id),
        ),
      )
      .returning();

    if (!updatedReminder) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          details:
            "Reminder not found or you don't have permission to update it",
        } satisfies ApiErrorResponse,
        { status: 404 },
      );
    }

    const response: ApiSuccessResponse<WorkoutReminder> = {
      success: true,
      data: updatedReminder as WorkoutReminder,
      message: "Workout reminder updated successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/reminders PUT:", error);

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
