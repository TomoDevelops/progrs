import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/config/auth/auth";
import { dashboardService } from "@/app/api/dashboard/services/dashboard.service";

import type {
  ApiSuccessResponse,
  ApiErrorResponse,
} from "@/app/api/dashboard/schemas/dashboard.schemas";

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

    // Get today's planned workout
    const todayWorkout = await dashboardService.getTodayWorkout(
      session.user.id,
    );

    const response: ApiSuccessResponse<typeof todayWorkout> = {
      success: true,
      data: todayWorkout,
      message: todayWorkout
        ? "Today's workout retrieved successfully"
        : "No workout scheduled for today",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/dashboard/today:", error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Internal Server Error",
      details:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
