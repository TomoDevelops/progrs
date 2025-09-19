import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/shared/config/auth/auth";
import { dashboardService } from "@/app/api/dashboard/services/dashboard.service";
import { TrendingMetricsQuerySchema } from "@/app/api/dashboard/schemas/dashboard.schemas";
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      limit: searchParams.get("limit") || undefined,
    };

    const validatedParams = TrendingMetricsQuerySchema.parse(queryParams);

    // Get trending metrics
    const trendingMetrics = await dashboardService.getTrendingMetrics(
      session.user.id,
      validatedParams.limit,
    );

    const response: ApiSuccessResponse<typeof trendingMetrics> = {
      success: true,
      data: trendingMetrics,
      message: `Retrieved top ${validatedParams.limit} trending metrics`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/dashboard/metrics:", error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes("must be")) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "Bad Request",
        details: error.message,
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
