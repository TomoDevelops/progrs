import { NextResponse } from "next/server";
import { getAuth } from "@/shared/config/auth/auth";
import { dashboardRepository } from "@/app/api/dashboard/repository/dashboard.repository";
import { headers } from "next/headers";

export async function GET() {
  const auth = getAuth();
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weeklyStats = await dashboardRepository.getCurrentAndLastWeekStats(
      session.user.id,
    );

    return NextResponse.json(weeklyStats);
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
