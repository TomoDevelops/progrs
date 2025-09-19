import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/shared/config/auth/auth";
import { dashboardService } from "@/app/api/dashboard/services/dashboard.service";
import type { ApiSuccessResponse, ApiErrorResponse } from "@/shared/types/api";

export async function GET(request: NextRequest) {
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

    // Get complete dashboard overview
    const dashboardOverview = await dashboardService.getDashboardOverview(
      session.user.id,
    );

    const response: ApiSuccessResponse<typeof dashboardOverview> = {
      success: true,
      data: dashboardOverview,
      message: "Dashboard overview retrieved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/dashboard:", error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Internal Server Error",
      details:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
