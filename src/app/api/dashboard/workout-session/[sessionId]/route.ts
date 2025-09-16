import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/config/auth/auth";
import { headers } from "next/headers";
import { dashboardRepository } from "@/app/api/dashboard/repository/dashboard.repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    // Get the session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Get workout session details
    const workoutDetail = await dashboardRepository.getWorkoutSessionDetail(
      session.user.id,
      sessionId,
    );

    if (!workoutDetail) {
      return NextResponse.json(
        { success: false, error: "Workout session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: workoutDetail,
    });
  } catch (error) {
    console.error("Error fetching workout session detail:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
