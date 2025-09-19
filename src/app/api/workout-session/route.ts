import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/shared/db/database";
import {
  workoutSessions,
  sessionExercises,
  exerciseSets,
  routineExercises,
  exercises,
} from "@/shared/db/schema/app-schema";
import { getAuth } from "@/shared/config/auth/auth";
import { headers } from "next/headers";
import { eq, and, sql } from "drizzle-orm";
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
  reps: z
    .number()
    .min(1, "Reps must be at least 1")
    .max(100, "Reps cannot exceed 100"),
});

// Schema for reordering exercises
const reorderExercisesSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  exerciseOrders: z
    .array(
      z.object({
        sessionExerciseId: z.string().min(1, "Session exercise ID is required"),
        orderIndex: z.number().min(0, "Order index cannot be negative"),
      }),
    )
    .min(1, "At least one exercise order is required"),
});

// Schema for repeating a workout session
const repeatSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export async function POST(request: NextRequest) {
  const db = getDb();
  const auth = getAuth();
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "reorderExercises") {
      const validation = reorderExercisesSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.issues[0].message },
          { status: 400 },
        );
      }

      const { sessionId, exerciseOrders } = validation.data;

      // Verify session belongs to user
      const sessionCheck = await db
        .select({ id: workoutSessions.id })
        .from(workoutSessions)
        .where(
          and(
            eq(workoutSessions.id, sessionId),
            eq(workoutSessions.userId, session.user.id),
          ),
        )
        .limit(1);

      if (sessionCheck.length === 0) {
        return NextResponse.json(
          { success: false, error: "Session not found" },
          { status: 404 },
        );
      }

      // Update exercise order indices
      await db.transaction(async (tx) => {
        for (const { sessionExerciseId, orderIndex } of exerciseOrders) {
          await tx
            .update(sessionExercises)
            .set({ orderIndex })
            .where(eq(sessionExercises.id, sessionExerciseId));
        }
      });

      return NextResponse.json({
        success: true,
        message: "Exercise order updated successfully",
      });
    }

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
          { status: 400 },
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
    }

    if (action === "repeat") {
      // Validate the request body for repeating a session
      const validationResult = repeatSessionSchema.safeParse(body);

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

      const { sessionId } = validationResult.data;

      // Get the original session with all its data
      const originalSession = await db
        .select({
          id: workoutSessions.id,
          name: workoutSessions.name,
          routineId: workoutSessions.routineId,
          userId: workoutSessions.userId,
        })
        .from(workoutSessions)
        .where(
          and(
            eq(workoutSessions.id, sessionId),
            eq(workoutSessions.userId, session.user.id),
          ),
        )
        .limit(1);

      if (originalSession.length === 0) {
        return NextResponse.json(
          { success: false, error: "Original session not found" },
          { status: 404 },
        );
      }

      const originalSessionData = originalSession[0];

      // Get all exercises and sets from the original session
      const originalExercises = await db
        .select({
          exerciseId: sessionExercises.exerciseId,
          name: sessionExercises.name,
          orderIndex: sessionExercises.orderIndex,
        })
        .from(sessionExercises)
        .where(eq(sessionExercises.sessionId, sessionId))
        .orderBy(sessionExercises.orderIndex);

      const originalSets = await db
        .select({
          sessionExerciseId: exerciseSets.sessionExerciseId,
          setNumber: exerciseSets.setNumber,
          weight: exerciseSets.weight,
          reps: exerciseSets.reps,
        })
        .from(exerciseSets)
        .innerJoin(
          sessionExercises,
          eq(exerciseSets.sessionExerciseId, sessionExercises.id),
        )
        .where(eq(sessionExercises.sessionId, sessionId))
        .orderBy(exerciseSets.sessionExerciseId, exerciseSets.setNumber);

      // Create a new workout session with the same data but new timestamp
      const result = await db.transaction(async (tx) => {
        // Create the new workout session
        const [newWorkoutSession] = await tx
          .insert(workoutSessions)
          .values({
            userId: session.user.id,
            routineId: originalSessionData.routineId,
            name: originalSessionData.name,
            startedAt: new Date(),
          })
          .returning({ id: workoutSessions.id });

        // Create session exercises with mapping from old to new IDs
        const exerciseIdMapping = new Map();
        for (const originalExercise of originalExercises) {
          const [newSessionExercise] = await tx
            .insert(sessionExercises)
            .values({
              sessionId: newWorkoutSession.id,
              exerciseId: originalExercise.exerciseId,
              name: originalExercise.name,
              orderIndex: originalExercise.orderIndex,
            })
            .returning({ id: sessionExercises.id });

          // Map old session exercise ID to new one
          exerciseIdMapping.set(
            originalExercise.exerciseId,
            newSessionExercise.id,
          );
        }

        // Group sets by session exercise ID
        const setsByExercise = new Map();
        for (const set of originalSets) {
          if (!setsByExercise.has(set.sessionExerciseId)) {
            setsByExercise.set(set.sessionExerciseId, []);
          }
          setsByExercise.get(set.sessionExerciseId).push(set);
        }

        // Create exercise sets for each new session exercise
        for (const originalExercise of originalExercises) {
          const newSessionExerciseId = exerciseIdMapping.get(
            originalExercise.exerciseId,
          );

          // Find the original session exercise ID to get its sets
          const originalSessionExercise = await tx
            .select({ id: sessionExercises.id })
            .from(sessionExercises)
            .where(
              and(
                eq(sessionExercises.sessionId, sessionId),
                originalExercise.exerciseId
                  ? eq(sessionExercises.exerciseId, originalExercise.exerciseId)
                  : sql`${sessionExercises.exerciseId} IS NULL`,
                eq(sessionExercises.orderIndex, originalExercise.orderIndex),
              ),
            )
            .limit(1);

          if (originalSessionExercise.length > 0) {
            const originalSessionExerciseId = originalSessionExercise[0].id;
            const exerciseSets =
              setsByExercise.get(originalSessionExerciseId) || [];

            if (exerciseSets.length > 0) {
              const setValues = exerciseSets.map(
                (set: {
                  sessionExerciseId: string;
                  setNumber: number;
                  weight: string | null;
                  reps: number;
                }) => ({
                  sessionExerciseId: newSessionExerciseId,
                  setNumber: set.setNumber,
                  weight: set.weight,
                  reps: set.reps,
                }),
              );

              await tx.insert(exerciseSets).values(setValues);
            }
          }
        }

        return newWorkoutSession;
      });

      return NextResponse.json({
        success: true,
        data: {
          sessionId: result.id,
        },
      });
    }

    if (action === "updateSet") {
      // Validate the request body for updating a set
      const validationResult = updateSetSchema.safeParse(body);

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

      const { sessionExerciseId, setNumber, weight, reps } =
        validationResult.data;

      // Verify the session exercise belongs to the user
      const sessionExercise = await db
        .select({
          sessionId: sessionExercises.sessionId,
        })
        .from(sessionExercises)
        .innerJoin(
          workoutSessions,
          eq(sessionExercises.sessionId, workoutSessions.id),
        )
        .where(
          and(
            eq(sessionExercises.id, sessionExerciseId),
            eq(workoutSessions.userId, session.user.id),
          ),
        )
        .limit(1);

      if (sessionExercise.length === 0) {
        return NextResponse.json(
          { success: false, error: "Session exercise not found" },
          { status: 404 },
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
            eq(exerciseSets.setNumber, setNumber),
          ),
        );

      return NextResponse.json({
        success: true,
        message: "Set updated successfully",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Invalid action. Supported actions: create, updateSet, reorderExercises, repeat",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error in workout session API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
