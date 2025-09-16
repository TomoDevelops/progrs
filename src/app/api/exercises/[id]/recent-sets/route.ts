import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db/database";
import {
  exerciseSets,
  sessionExercises,
  workoutSessions,
} from "@/shared/db/schema/app-schema";
import { auth } from "@/shared/config/auth/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: exerciseId } = await params;

    if (!exerciseId) {
      return NextResponse.json(
        { success: false, error: "Exercise ID is required" },
        { status: 400 },
      );
    }

    // Get the most recent 3 sets for this exercise
    const recentSets = await db
      .select({
        id: exerciseSets.id,
        setNumber: exerciseSets.setNumber,
        weight: exerciseSets.weight,
        reps: exerciseSets.reps,
        sessionDate: workoutSessions.startedAt,
        sessionName: workoutSessions.name,
      })
      .from(exerciseSets)
      .innerJoin(
        sessionExercises,
        eq(exerciseSets.sessionExerciseId, sessionExercises.id),
      )
      .innerJoin(
        workoutSessions,
        eq(sessionExercises.sessionId, workoutSessions.id),
      )
      .where(
        and(
          eq(sessionExercises.exerciseId, exerciseId),
          eq(workoutSessions.userId, session.user.id),
        ),
      )
      .orderBy(desc(workoutSessions.startedAt), desc(exerciseSets.setNumber))
      .limit(3);

    return NextResponse.json({
      success: true,
      data: recentSets,
    });
  } catch (error) {
    console.error("Error fetching recent sets:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
