import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db/database";
import {
  workoutSessions,
  sessionExercises,
  exerciseSets,
  exercises,
  workoutRoutines,
  routineExercises,
} from "@/shared/db/schema/app-schema";
import { auth } from "@/shared/config/auth/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

// Schema for finishing a workout session
const finishSessionSchema = z.object({
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Get the workout session with routine info
    const workoutSession = await db
      .select({
        id: workoutSessions.id,
        name: workoutSessions.name,
        routineId: workoutSessions.routineId,
        startedAt: workoutSessions.startedAt,
        endedAt: workoutSessions.endedAt,
        totalDuration: workoutSessions.totalDuration,
        notes: workoutSessions.notes,
        routineName: workoutRoutines.name,
        estimatedDuration: workoutRoutines.estimatedDuration,
      })
      .from(workoutSessions)
      .leftJoin(
        workoutRoutines,
        eq(workoutSessions.routineId, workoutRoutines.id),
      )
      .where(
        and(
          eq(workoutSessions.id, sessionId),
          eq(workoutSessions.userId, session.user.id),
        ),
      )
      .limit(1);

    if (workoutSession.length === 0) {
      return NextResponse.json(
        { success: false, error: "Workout session not found" },
        { status: 404 },
      );
    }

    const sessionData = workoutSession[0];

    // Get all exercises and sets for this session
    const exercisesWithSets = sessionData.routineId
      ? await db
          .select({
            sessionExerciseId: sessionExercises.id,
            exerciseId: sessionExercises.exerciseId,
            exerciseName: exercises.name,
            orderIndex: sessionExercises.orderIndex,
            muscleGroup: exercises.muscleGroup,
            equipment: exercises.equipment,
            setId: exerciseSets.id,
            setNumber: exerciseSets.setNumber,
            weight: exerciseSets.weight,
            reps: exerciseSets.reps,
            targetWeight: routineExercises.targetWeight,
            minReps: routineExercises.minReps,
            maxReps: routineExercises.maxReps,
            restTime: routineExercises.restTime,
          })
          .from(sessionExercises)
          .leftJoin(exercises, eq(sessionExercises.exerciseId, exercises.id))
          .leftJoin(
            exerciseSets,
            eq(sessionExercises.id, exerciseSets.sessionExerciseId),
          )
          .leftJoin(
            routineExercises,
            and(
              eq(routineExercises.routineId, sessionData.routineId),
              eq(routineExercises.exerciseId, sessionExercises.exerciseId),
            ),
          )
          .where(eq(sessionExercises.sessionId, sessionId))
          .orderBy(sessionExercises.orderIndex, exerciseSets.setNumber)
      : await db
          .select({
            sessionExerciseId: sessionExercises.id,
            exerciseId: sessionExercises.exerciseId,
            exerciseName: exercises.name,
            orderIndex: sessionExercises.orderIndex,
            muscleGroup: exercises.muscleGroup,
            equipment: exercises.equipment,
            setId: exerciseSets.id,
            setNumber: exerciseSets.setNumber,
            weight: exerciseSets.weight,
            reps: exerciseSets.reps,
            targetWeight: sql<number | null>`NULL`,
            minReps: sql<number | null>`NULL`,
            maxReps: sql<number | null>`NULL`,
            restTime: sql<number | null>`NULL`,
          })
          .from(sessionExercises)
          .leftJoin(exercises, eq(sessionExercises.exerciseId, exercises.id))
          .leftJoin(
            exerciseSets,
            eq(sessionExercises.id, exerciseSets.sessionExerciseId),
          )
          .where(eq(sessionExercises.sessionId, sessionId))
          .orderBy(sessionExercises.orderIndex, exerciseSets.setNumber);

    // Group exercises and their sets
    const exerciseMap = new Map();

    exercisesWithSets.forEach((row) => {
      if (!exerciseMap.has(row.sessionExerciseId)) {
        exerciseMap.set(row.sessionExerciseId, {
          id: row.sessionExerciseId,
          exerciseId: row.exerciseId,
          name: row.exerciseName,
          orderIndex: row.orderIndex,
          muscleGroup: row.muscleGroup,
          equipment: row.equipment,
          targetWeight: row.targetWeight
            ? typeof row.targetWeight === "string"
              ? parseFloat(row.targetWeight)
              : row.targetWeight
            : null,
          minReps: row.minReps,
          maxReps: row.maxReps,
          restTime: row.restTime,
          sets: [],
        });
      }

      if (row.setId) {
        exerciseMap.get(row.sessionExerciseId).sets.push({
          id: row.setId,
          setNumber: row.setNumber,
          weight: row.weight ? parseFloat(row.weight) : null,
          reps: row.reps || 0,
          isCompleted: row.weight !== null && (row.reps || 0) > 0,
        });
      }
    });

    const sessionExercisesList = Array.from(exerciseMap.values()).sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );

    // Calculate session duration if active
    let currentDuration = null;
    if (!sessionData.endedAt) {
      const now = new Date();
      const startTime = new Date(sessionData.startedAt);
      currentDuration = Math.floor(
        (now.getTime() - startTime.getTime()) / 1000 / 60,
      ); // in minutes
    }

    return NextResponse.json({
      success: true,
      data: {
        id: sessionData.id,
        name: sessionData.name,
        routineName: sessionData.routineName,
        startedAt: sessionData.startedAt,
        endedAt: sessionData.endedAt,
        totalDuration: sessionData.totalDuration,
        currentDuration,
        estimatedDuration: sessionData.estimatedDuration,
        notes: sessionData.notes,
        exercises: sessionExercisesList,
        isActive: !sessionData.endedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching workout session:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const { id: sessionId } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === "finish") {
      // Validate the request body
      const validationResult = finishSessionSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: validationResult.error.issues,
          },
          { status: 400 },
        );
      }

      const { notes } = validationResult.data;

      // Verify the session belongs to the user and is still active
      const workoutSession = await db
        .select({
          id: workoutSessions.id,
          startedAt: workoutSessions.startedAt,
          endedAt: workoutSessions.endedAt,
        })
        .from(workoutSessions)
        .where(
          and(
            eq(workoutSessions.id, sessionId),
            eq(workoutSessions.userId, session.user.id),
          ),
        )
        .limit(1);

      if (workoutSession.length === 0) {
        return NextResponse.json(
          { success: false, error: "Workout session not found" },
          { status: 404 },
        );
      }

      const sessionData = workoutSession[0];

      if (sessionData.endedAt) {
        return NextResponse.json(
          { success: false, error: "Workout session is already finished" },
          { status: 400 },
        );
      }

      // Calculate total duration
      const endTime = new Date();
      const startTime = new Date(sessionData.startedAt);
      const totalDuration = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000 / 60,
      ); // in minutes

      // Update the session
      await db
        .update(workoutSessions)
        .set({
          endedAt: endTime,
          totalDuration,
          notes,
        })
        .where(eq(workoutSessions.id, sessionId));

      return NextResponse.json({
        success: true,
        data: {
          endedAt: endTime,
          totalDuration,
        },
      });
    }
    
    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error updating workout session:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
