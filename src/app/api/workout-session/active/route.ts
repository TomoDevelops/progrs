import { NextResponse } from "next/server";
import { getAuth } from "@/shared/config/auth/auth";
import { getDb } from "@/shared/db/database";
import { workoutSessions } from "@/shared/db/schema/app-schema";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const db = getDb();
  const auth = getAuth();
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Find active workout session (endedAt is null)
    const activeSession = await db
      .select({
        id: workoutSessions.id,
        name: workoutSessions.name,
        startedAt: workoutSessions.startedAt,
      })
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, session.user.id),
          isNull(workoutSessions.endedAt),
        ),
      )
      .limit(1);

    return NextResponse.json({
      success: true,
      data: activeSession.length > 0 ? activeSession[0] : null,
    });
  } catch (error) {
    console.error("Error fetching active session:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
