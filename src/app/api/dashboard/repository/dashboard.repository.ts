import { db } from "@/shared/db/database";
import {
  workoutRoutines,
  routineSchedule,
  workoutSessions,
  exercises,
  routineExercises,
  sessionExercises,
  exerciseSets,
  personalRecords,
} from "@/shared/db/schema/app-schema";
import { eq, desc, gte, lte, and, count, avg, sql } from "drizzle-orm";
import { getTodayUTC, getUTCDateRange } from "@/shared/utils/date";

export interface TodayWorkoutData {
  id: string;
  name: string;
  description: string | null;
  estimatedDuration: number | null;
  exercises: {
    id: string;
    name: string;
    muscleGroup: string;
    equipment: string | null;
  }[];
}

export interface WorkoutHistoryItem {
  id: string;
  routineName: string;
  endedAt: Date | null;
  totalDuration: number | null;
  totalExercises: number;
  totalSets: number;
  notes: string | null;
}

export interface ConsistencyData {
  date: string;
  workoutsCompleted: number;
}

export interface TrendingMetric {
  exerciseName: string;
  muscleGroup: string;
  currentWeight: number;
  previousWeight: number;
  improvement: number;
  improvementPercentage: number;
}

export interface SummaryStats {
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  averageDuration: number;
  currentStreak: number;
  longestStreak: number;
  totalWeightLifted: number;
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  maxWeight: number;
  achievedAt: Date;
  isRecent: boolean;
}

export interface WeeklyStats {
  workouts: number;
  duration: number; // in minutes
  volume: number; // in kg
}

export interface WorkoutSessionDetail {
  id: string;
  routineName: string;
  startedAt: Date;
  endedAt: Date | null;
  totalDuration: number | null;
  notes: string | null;
  exercises: {
    id: string;
    name: string;
    muscleGroup: string | null;
    equipment: string | null;
    sets: {
      setNumber: number;
      weight: number | null;
      reps: number;
    }[];
  }[];
}

export class DashboardRepository {
  async getTodayPlannedWorkouts(userId: string): Promise<TodayWorkoutData[]> {
    const today = getTodayUTC(); // Get today's date in UTC

    // Get today's scheduled routines
    const scheduledRoutines = await db
      .select({
        routineId: routineSchedule.routineId,
        routine: {
          id: workoutRoutines.id,
          name: workoutRoutines.name,
          description: workoutRoutines.description,
          estimatedDuration: workoutRoutines.estimatedDuration,
        },
      })
      .from(routineSchedule)
      .innerJoin(
        workoutRoutines,
        eq(routineSchedule.routineId, workoutRoutines.id),
      )
      .where(
        and(
          eq(workoutRoutines.userId, userId),
          eq(routineSchedule.scheduledDate, today),
          eq(workoutRoutines.isActive, true),
        ),
      );

    if (scheduledRoutines.length === 0) {
      return [];
    }

    // Filter out routines that have already been completed today
    const routinesNotCompleted = await Promise.all(
      scheduledRoutines.map(async (scheduledRoutine) => {
        // Check if this routine has been completed today
        const completedSession = await db
          .select({ id: workoutSessions.id })
          .from(workoutSessions)
          .where(
            and(
              eq(workoutSessions.userId, userId),
              eq(workoutSessions.routineId, scheduledRoutine.routineId),
              sql`DATE(${workoutSessions.endedAt}) = ${today}`,
              sql`${workoutSessions.endedAt} IS NOT NULL`,
            ),
          )
          .limit(1);

        // Return the routine only if it hasn't been completed today
        return completedSession.length === 0 ? scheduledRoutine : null;
      }),
    );

    // Filter out null values (completed routines)
    const availableRoutines = routinesNotCompleted.filter(
      (routine): routine is NonNullable<typeof routine> => routine !== null,
    );

    if (availableRoutines.length === 0) {
      return [];
    }

    // Get exercises for each routine
    const workoutsWithExercises = await Promise.all(
      availableRoutines.map(async (scheduledRoutine) => {
        const routine = scheduledRoutine.routine;

        // Get exercises for this routine from the routine template
        const routineExercisesList = await db
          .select({
            exercise: {
              id: exercises.id,
              name: exercises.name,
              muscleGroup: exercises.muscleGroup,
              equipment: exercises.equipment,
            },
          })
          .from(routineExercises)
          .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
          .where(eq(routineExercises.routineId, routine.id))
          .orderBy(routineExercises.orderIndex);

        return {
          id: routine.id,
          name: routine.name,
          description: routine.description,
          estimatedDuration: routine.estimatedDuration,
          exercises: routineExercisesList.map((item) => ({
            id: item.exercise.id,
            name: item.exercise.name,
            muscleGroup: item.exercise.muscleGroup || "Unknown",
            equipment: item.exercise.equipment,
          })),
        };
      }),
    );

    return workoutsWithExercises;
  }

  // Keep the old method for backward compatibility
  async getTodayPlannedWorkout(
    userId: string,
  ): Promise<TodayWorkoutData | null> {
    const workouts = await this.getTodayPlannedWorkouts(userId);
    return workouts.length > 0 ? workouts[0] : null;
  }

  async getWorkoutHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<WorkoutHistoryItem[]> {
    // Only get completed workout sessions
    const sessions = await db
      .select({
        id: workoutSessions.id,
        routineName: workoutRoutines.name,
        endedAt: workoutSessions.endedAt,
        totalDuration: workoutSessions.totalDuration,
        notes: workoutSessions.notes,
        exerciseCount: count(sessionExercises.id),
      })
      .from(workoutSessions)
      .leftJoin(
        workoutRoutines,
        eq(workoutSessions.routineId, workoutRoutines.id),
      )
      .leftJoin(
        sessionExercises,
        eq(workoutSessions.id, sessionExercises.sessionId),
      )
      .where(
        and(
          eq(workoutSessions.userId, userId),
          sql`${workoutSessions.endedAt} IS NOT NULL`,
        ),
      )
      .groupBy(
        workoutSessions.id,
        workoutRoutines.name,
        workoutSessions.endedAt,
        workoutSessions.totalDuration,
        workoutSessions.notes,
      )
      .orderBy(desc(workoutSessions.endedAt))
      .limit(limit)
      .offset(offset);

    // Get total sets for each session
    const sessionsWithSets = await Promise.all(
      sessions.map(async (session) => {
        const setsCount = await db
          .select({
            totalSets: count(exerciseSets.id),
          })
          .from(exerciseSets)
          .innerJoin(
            sessionExercises,
            eq(exerciseSets.sessionExerciseId, sessionExercises.id),
          )
          .where(eq(sessionExercises.sessionId, session.id));

        return {
          id: session.id,
          routineName: session.routineName || "Custom Workout",
          endedAt: session.endedAt,
          totalDuration: session.totalDuration,
          totalExercises: Number(session.exerciseCount),
          totalSets: Number(setsCount[0]?.totalSets || 0),
          notes: session.notes,
        };
      }),
    );

    return sessionsWithSets;
  }

  async getConsistencyData(
    userId: string,
    days: number = 30,
  ): Promise<ConsistencyData[]> {
    const { startDate, endDate } = getUTCDateRange(days);

    const consistencyData = await db
      .select({
        date: sql<string>`DATE(${workoutSessions.endedAt})`,
        workoutsCompleted: count(workoutSessions.id),
      })
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          gte(workoutSessions.endedAt, startDate),
          lte(workoutSessions.endedAt, endDate),
          sql`${workoutSessions.endedAt} IS NOT NULL`,
        ),
      )
      .groupBy(sql`DATE(${workoutSessions.endedAt})`)
      .orderBy(sql`DATE(${workoutSessions.endedAt})`);

    return consistencyData;
  }

  async getTrendingMetrics(
    userId: string,
    limit: number = 5,
  ): Promise<TrendingMetric[]> {
    // Get recent personal records with improvements
    const recentRecords = await db
      .select({
        exerciseName: exercises.name,
        muscleGroup: exercises.muscleGroup,
        currentWeight: personalRecords.maxWeight,
        achievedAt: personalRecords.achievedAt,
      })
      .from(personalRecords)
      .innerJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
      .where(eq(personalRecords.userId, userId))
      .orderBy(desc(personalRecords.achievedAt))
      .limit(limit);

    // For simplicity, return mock improvement data
    return recentRecords.map((record) => ({
      exerciseName: record.exerciseName,
      muscleGroup: record.muscleGroup || "Unknown",
      currentWeight: Number(record.currentWeight || 0),
      previousWeight: Number(record.currentWeight || 0) * 0.9, // Mock previous weight
      improvement: Number(record.currentWeight || 0) * 0.1,
      improvementPercentage: 10, // Mock 10% improvement
    }));
  }

  async getSummaryStats(userId: string): Promise<SummaryStats> {
    // Get basic workout stats
    const workoutStats = await db
      .select({
        totalWorkouts: count(workoutSessions.id),
        averageDuration: avg(workoutSessions.totalDuration),
      })
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          sql`${workoutSessions.endedAt} IS NOT NULL`,
        ),
      );

    // Get exercise and set counts
    const exerciseStats = await db
      .select({
        totalExercises: count(sessionExercises.id),
      })
      .from(sessionExercises)
      .innerJoin(
        workoutSessions,
        eq(sessionExercises.sessionId, workoutSessions.id),
      )
      .where(
        and(
          eq(workoutSessions.userId, userId),
          sql`${workoutSessions.endedAt} IS NOT NULL`,
        ),
      );

    // Calculate total weight lifted (from exercise sets)
    const weightStats = await db
      .select({
        totalWeight: sql<number>`COALESCE(SUM(CAST(${exerciseSets.weight} AS DECIMAL) * ${exerciseSets.reps}), 0)`,
        totalSets: count(exerciseSets.id),
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
          eq(workoutSessions.userId, userId),
          sql`${workoutSessions.endedAt} IS NOT NULL`,
          sql`${exerciseSets.weight} IS NOT NULL`,
        ),
      );

    return {
      totalWorkouts: Number(workoutStats[0]?.totalWorkouts || 0),
      totalExercises: Number(exerciseStats[0]?.totalExercises || 0),
      totalSets: Number(weightStats[0]?.totalSets || 0),
      averageDuration: Math.round(
        Number(workoutStats[0]?.averageDuration || 0),
      ),
      currentStreak: 0, // Simplified for now
      longestStreak: 0, // Simplified for now
      totalWeightLifted: Math.round(Number(weightStats[0]?.totalWeight || 0)),
    };
  }

  async getWorkoutSessionDetail(
    userId: string,
    sessionId: string,
  ): Promise<WorkoutSessionDetail | null> {
    // Get the workout session
    const session = await db
      .select({
        id: workoutSessions.id,
        routineName: workoutRoutines.name,
        startedAt: workoutSessions.startedAt,
        endedAt: workoutSessions.endedAt,
        totalDuration: workoutSessions.totalDuration,
        notes: workoutSessions.notes,
      })
      .from(workoutSessions)
      .leftJoin(
        workoutRoutines,
        eq(workoutSessions.routineId, workoutRoutines.id),
      )
      .where(
        and(
          eq(workoutSessions.id, sessionId),
          eq(workoutSessions.userId, userId),
        ),
      )
      .limit(1);

    if (session.length === 0) {
      return null;
    }

    const sessionData = session[0];

    // Get exercises and their sets for this session
    const exercisesWithSets = await db
      .select({
        exerciseId: sessionExercises.id,
        exerciseName: sessionExercises.name,
        muscleGroup: exercises.muscleGroup,
        equipment: exercises.equipment,
        setNumber: exerciseSets.setNumber,
        weight: exerciseSets.weight,
        reps: exerciseSets.reps,
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
      if (!exerciseMap.has(row.exerciseId)) {
        exerciseMap.set(row.exerciseId, {
          id: row.exerciseId,
          name: row.exerciseName,
          muscleGroup: row.muscleGroup,
          equipment: row.equipment,
          sets: [],
        });
      }

      if (row.setNumber !== null) {
        exerciseMap.get(row.exerciseId).sets.push({
          setNumber: row.setNumber,
          weight: row.weight ? Number(row.weight) : null,
          reps: row.reps,
        });
      }
    });

    return {
      id: sessionData.id,
      routineName: sessionData.routineName || "Custom Workout",
      startedAt: sessionData.startedAt,
      endedAt: sessionData.endedAt,
      totalDuration: sessionData.totalDuration,
      notes: sessionData.notes,
      exercises: Array.from(exerciseMap.values()),
    };
  }

  async getRecentPersonalRecords(
    userId: string,
    limit: number = 10,
    days: number = 30,
  ): Promise<PersonalRecord[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const records = await db
      .select({
        id: personalRecords.id,
        exerciseName: exercises.name,
        maxWeight: personalRecords.maxWeight,
        achievedAt: personalRecords.achievedAt,
      })
      .from(personalRecords)
      .innerJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
      .where(
        and(
          eq(personalRecords.userId, userId),
          gte(personalRecords.achievedAt, cutoffDate),
        ),
      )
      .orderBy(desc(personalRecords.achievedAt))
      .limit(limit);

    return records.map((record) => ({
      id: record.id,
      exerciseName: record.exerciseName,
      maxWeight: Number(record.maxWeight),
      achievedAt: record.achievedAt,
      isRecent: true,
    }));
  }

  async getWeeklyStats(
    userId: string,
    weekOffset: number = 0,
  ): Promise<WeeklyStats> {
    // Calculate the start and end of the target week
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() - weekOffset * 7); // Start of week (Sunday)
    currentWeekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);

    // Get completed workout sessions for the week
    const sessions = await db
      .select({
        id: workoutSessions.id,
        totalDuration: workoutSessions.totalDuration,
        endedAt: workoutSessions.endedAt,
      })
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          gte(workoutSessions.endedAt, currentWeekStart),
          lte(workoutSessions.endedAt, weekEnd),
          sql`${workoutSessions.endedAt} IS NOT NULL`,
        ),
      );

    // Calculate total volume for the week
    const volumeResult = await db
      .select({
        totalVolume: sql<number>`COALESCE(SUM(${exerciseSets.weight} * ${exerciseSets.reps}), 0)`,
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
          eq(workoutSessions.userId, userId),
          gte(workoutSessions.endedAt, currentWeekStart),
          lte(workoutSessions.endedAt, weekEnd),
          sql`${workoutSessions.endedAt} IS NOT NULL`,
          sql`${exerciseSets.weight} IS NOT NULL`,
        ),
      );

    const totalDuration = sessions.reduce((sum, session) => {
      return sum + (session.totalDuration || 0);
    }, 0);

    return {
      workouts: sessions.length,
      duration: totalDuration,
      volume: Number(volumeResult[0]?.totalVolume || 0),
    };
  }

  async getCurrentAndLastWeekStats(
    userId: string,
  ): Promise<{ currentWeek: WeeklyStats; lastWeek: WeeklyStats }> {
    const [currentWeek, lastWeek] = await Promise.all([
      this.getWeeklyStats(userId, 0), // Current week
      this.getWeeklyStats(userId, 1), // Last week
    ]);

    return { currentWeek, lastWeek };
  }
}

export const dashboardRepository = new DashboardRepository();
