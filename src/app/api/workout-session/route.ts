import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db/database";
import {
  workoutSessions,
  sessionExercises,
  exerciseSets,
  routineExercises,
  exercises,
  workoutRoutines,
} from "@/shared/db/schema/app-schema";
import { auth } from "@/shared/config/auth/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Schema for creating a new workout session
const createSessionSchema = z.object({
  routineId: z.string().min(1, "Routine ID is required"),
  name: z.string().min(1, "Session name is required"),
});

// Schema for updating a set
const updateSetSchema = z.object({
  sessionExerciseId: z.string().min(1, "Session exercise ID is required"),
  setNumber: z.number().min(1, "Set number must be at least 1"),
  weight: z.number().min(0, "Weight cannot be negative"),
  reps: z.number().min(1, "Reps must be at least 1").max(100, "Reps cannot exceed 100"),
});

export async function POST(request: NextRequest) {
  try {
    // Get the session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      // Validate the request body for creating a session
      const validationResult = createSessionSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: validationResult.error.issues,
          },
          { status: 400 }
        );
      }

      const { routineId, name } = validationResult.data;

      // Start a transaction to create the workout session and exercises
      const result = await db.transaction(async (tx) => {
        // Create the workout session
        const [workoutSession] = await tx
          .insert(workoutSessions)
          .values({
            userId: session.user.id,
            routineId,
            name,
            startedAt: new Date(),
          })
          .returning({ id: workoutSessions.id });

        // Get routine exercises to create session exercises
        const routineExercisesList = await tx
          .select({
            exerciseId: routineExercises.exerciseId,
            orderIndex: routineExercises.orderIndex,
            sets: routineExercises.sets,
            exercise: {
              name: exercises.name,
            },
          })
          .from(routineExercises)
          .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
          .where(eq(routineExercises.routineId, routineId))
          .orderBy(routineExercises.orderIndex);

        // Create session exercises
        const sessionExerciseIds = [];
        for (const routineExercise of routineExercisesList) {
          const [sessionExercise] = await tx
            .insert(sessionExercises)
            .values({
              sessionId: workoutSession.id,
              exerciseId: routineExercise.exerciseId,
              name: routineExercise.exercise.name,
              orderIndex: routineExercise.orderIndex,
            })
            .returning({ id: sessionExercises.id });

          sessionExerciseIds.push({
            id: sessionExercise.id,
            sets: routineExercise.sets,
          });
        }

        // Create empty exercise sets for each session exercise
        for (const sessionExercise of sessionExerciseIds) {
          const setValues = [];
          for (let i = 1; i <= sessionExercise.sets; i++) {
            setValues.push({
              sessionExerciseId: sessionExercise.id,
              setNumber: i,
              reps: 0, // Will be updated when user records the set
            });
          }
          
          if (setValues.length > 0) {
            await tx.insert(exerciseSets).values(setValues);
          }
        }

        return workoutSession;
      });

      return NextResponse.json({
        success: true,
        data: {
          sessionId: result.id,
        },
      });
    } else if (action === "updateSet") {
      // Validate the request body for updating a set
      const validationResult = updateSetSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: validationResult.error.issues,
          },
          { status: 400 }
        );
      }

      const { sessionExerciseId, setNumber, weight, reps } = validationResult.data;

      // Verify the session exercise belongs to the user
      const sessionExercise = await db
        .select({
          sessionId: sessionExercises.sessionId,
        })
        .from(sessionExercises)
        .innerJoin(workoutSessions, eq(sessionExercises.sessionId, workoutSessions.id))
        .where(
          and(
            eq(sessionExercises.id, sessionExerciseId),
            eq(workoutSessions.userId, session.user.id)
          )
        )
        .limit(1);

      if (sessionExercise.length === 0) {
        return NextResponse.json(
          { success: false, error: "Session exercise not found" },
          { status: 404 }
        );
      }

      // Update the exercise set
      await db
        .update(exerciseSets)
        .set({
          weight: weight.toString(),
          reps,
        })
        .where(
          and(
            eq(exerciseSets.sessionExerciseId, sessionExerciseId),
            eq(exerciseSets.setNumber, setNumber)
          )
        );

      return NextResponse.json({
        success: true,
        message: "Set updated successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in workout session API:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}