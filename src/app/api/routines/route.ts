import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/shared/db/database";
import {
  workoutRoutines,
  routineExercises,
  routineSchedule,
} from "@/shared/db/schema/app-schema";
import { workoutRoutineSchema } from "@/features/workout-routines/types";
import { getAuth } from "@/shared/config/auth/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const db = getDb();
  const auth = getAuth();
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

    const body = await request.json();

    // Transform date strings back to Date objects for validation
    const transformedBody = {
      ...body,
      schedule: body.schedule
        ? {
            ...body.schedule,
            startDate: body.schedule.startDate
              ? new Date(body.schedule.startDate)
              : undefined,
            endDate: body.schedule.endDate
              ? new Date(body.schedule.endDate)
              : undefined,
          }
        : undefined,
    };

    // Validate the request body
    const validationResult = workoutRoutineSchema.safeParse(transformedBody);

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

    const { name, description, duration, exercises, schedule } =
      validationResult.data;

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Create the workout routine
      const [routine] = await tx
        .insert(workoutRoutines)
        .values({
          name,
          description,
          estimatedDuration: duration,
          userId: session.user.id,
        })
        .returning({
          id: workoutRoutines.id,
          name: workoutRoutines.name,
          createdAt: workoutRoutines.createdAt,
        });

      // Create routine exercises
      if (exercises.length > 0) {
        await tx.insert(routineExercises).values(
          exercises.map((exercise, index) => ({
            routineId: routine.id,
            exerciseId: exercise.exerciseId,
            orderIndex: index,
            sets: exercise.sets,
            minReps: exercise.minReps,
            maxReps: exercise.maxReps,
            targetWeight: exercise.targetWeight?.toString(),
            restTime: exercise.restTime,
            notes: exercise.notes,
          })),
        );
      }

      // Create routine schedule if provided
      if (schedule) {
        await tx.insert(routineSchedule).values({
          routineId: routine.id,
          userId: session.user.id,
          scheduledDate: schedule.startDate.toISOString().split("T")[0], // Convert to date string
        });
      }

      return routine;
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        name: result.name,
        createdAt: result.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating workout routine:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  const db = getDb();
  const auth = getAuth();
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

    // Get user's workout routines
    const routines = await db
      .select({
        id: workoutRoutines.id,
        name: workoutRoutines.name,
        description: workoutRoutines.description,
        estimatedDuration: workoutRoutines.estimatedDuration,
        createdAt: workoutRoutines.createdAt,
      })
      .from(workoutRoutines)
      .where(eq(workoutRoutines.userId, session.user.id))
      .orderBy(desc(workoutRoutines.createdAt));

    return NextResponse.json({
      success: true,
      data: routines,
    });
  } catch (error) {
    console.error("Error fetching workout routines:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
