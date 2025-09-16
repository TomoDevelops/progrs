import { db } from "@/shared/db/database";
import {
  workoutSessions,
  sessionExercises,
  exerciseSets,
  exercises,
} from "@/shared/db/schema/app-schema";
import { eq, desc, gte, lte, and, count, sql, max } from "drizzle-orm";
import { subWeeks, subMonths, subYears, format } from "date-fns";

export interface ProgressDataPoint {
  date: string;
  value: number;
  sessionId: string;
}

export interface ExerciseInfo {
  id: string;
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
}

export class ProgressRepository {
  async getMostFrequentExercise(
    userId: string,
    timeframe: string
  ): Promise<string | null> {
    const dateRange = this.getDateRange(timeframe);

    const result = await db
      .select({
        exerciseId: sessionExercises.exerciseId,
        exerciseName: sessionExercises.name,
        count: count(sessionExercises.id),
      })
      .from(sessionExercises)
      .innerJoin(
        workoutSessions,
        eq(sessionExercises.sessionId, workoutSessions.id)
      )
      .where(
        and(
          eq(workoutSessions.userId, userId),
          sql`${workoutSessions.endedAt} IS NOT NULL`,
          dateRange.start ? gte(workoutSessions.endedAt, dateRange.start) : undefined,
          dateRange.end ? lte(workoutSessions.endedAt, dateRange.end) : undefined
        )
      )
      .groupBy(sessionExercises.exerciseId, sessionExercises.name)
      .orderBy(desc(count(sessionExercises.id)))
      .limit(1);

    return result[0]?.exerciseId || null;
  }

  async getProgressData(
    userId: string,
    exerciseId: string,
    timeframe: string,
    metric: "weight" | "reps" | "volume"
  ): Promise<ProgressDataPoint[]> {
    const dateRange = this.getDateRange(timeframe);

    let selectClause;
    switch (metric) {
      case "weight":
        selectClause = max(exerciseSets.weight);
        break;
      case "reps":
        selectClause = max(exerciseSets.reps);
        break;
      case "volume":
        selectClause = sql`SUM(COALESCE(${exerciseSets.weight}, 0) * ${exerciseSets.reps})`;
        break;
      default:
        selectClause = max(exerciseSets.weight);
    }

    const result = await db
      .select({
        date: sql`DATE(${workoutSessions.endedAt})`.as("date"),
        value: selectClause.as("value"),
        sessionId: workoutSessions.id,
      })
      .from(workoutSessions)
      .innerJoin(
        sessionExercises,
        eq(workoutSessions.id, sessionExercises.sessionId)
      )
      .innerJoin(
        exerciseSets,
        eq(sessionExercises.id, exerciseSets.sessionExerciseId)
      )
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(sessionExercises.exerciseId, exerciseId),
          sql`${workoutSessions.endedAt} IS NOT NULL`,
          dateRange.start ? gte(workoutSessions.endedAt, dateRange.start) : undefined,
          dateRange.end ? lte(workoutSessions.endedAt, dateRange.end) : undefined,
          metric === "weight" ? sql`${exerciseSets.weight} IS NOT NULL` : undefined
        )
      )
      .groupBy(sql`DATE(${workoutSessions.endedAt})`, workoutSessions.id)
      .orderBy(sql`DATE(${workoutSessions.endedAt})`);

    return result.map((row) => ({
      date: format(new Date(row.date as string), "yyyy-MM-dd"),
      value: Number(row.value) || 0,
      sessionId: row.sessionId,
    }));
  }

  async getExerciseInfo(exerciseId: string): Promise<ExerciseInfo | null> {
    const result = await db
      .select({
        id: exercises.id,
        name: exercises.name,
        muscleGroup: exercises.muscleGroup,
        equipment: exercises.equipment,
      })
      .from(exercises)
      .where(eq(exercises.id, exerciseId))
      .limit(1);

    return result[0] || null;
  }

  async getFavoriteExercises(
    userId: string,
    limit: number = 5
  ): Promise<ExerciseInfo[]> {
    const result = await db
      .select({
        id: exercises.id,
        name: exercises.name,
        muscleGroup: exercises.muscleGroup,
        equipment: exercises.equipment,
        count: count(sessionExercises.id),
      })
      .from(exercises)
      .innerJoin(sessionExercises, eq(exercises.id, sessionExercises.exerciseId))
      .innerJoin(
        workoutSessions,
        eq(sessionExercises.sessionId, workoutSessions.id)
      )
      .where(
        and(
          eq(workoutSessions.userId, userId),
          sql`${workoutSessions.endedAt} IS NOT NULL`
        )
      )
      .groupBy(exercises.id, exercises.name, exercises.muscleGroup, exercises.equipment)
      .orderBy(desc(count(sessionExercises.id)))
      .limit(limit);

    return result.map((row) => ({
      id: row.id,
      name: row.name,
      muscleGroup: row.muscleGroup,
      equipment: row.equipment,
    }));
  }

  async getAllUserExercises(
    userId: string,
    search?: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<{ exercises: ExerciseInfo[]; total: number }> {
    const whereConditions = [
      eq(workoutSessions.userId, userId),
      sql`${workoutSessions.endedAt} IS NOT NULL`,
    ];

    if (search) {
      whereConditions.push(
        sql`LOWER(${exercises.name}) LIKE LOWER(${"%" + search + "%"})`
      );
    }

    const [exercisesResult, totalResult] = await Promise.all([
      db
        .select({
          id: exercises.id,
          name: exercises.name,
          muscleGroup: exercises.muscleGroup,
          equipment: exercises.equipment,
        })
        .from(exercises)
        .innerJoin(sessionExercises, eq(exercises.id, sessionExercises.exerciseId))
        .innerJoin(
          workoutSessions,
          eq(sessionExercises.sessionId, workoutSessions.id)
        )
        .where(and(...whereConditions))
        .groupBy(exercises.id, exercises.name, exercises.muscleGroup, exercises.equipment)
        .orderBy(exercises.name)
        .offset(offset)
        .limit(limit),
      
      db
        .select({ count: count(sql`DISTINCT ${exercises.id}`) })
        .from(exercises)
        .innerJoin(sessionExercises, eq(exercises.id, sessionExercises.exerciseId))
        .innerJoin(
          workoutSessions,
          eq(sessionExercises.sessionId, workoutSessions.id)
        )
        .where(and(...whereConditions)),
    ]);

    return {
      exercises: exercisesResult,
      total: Number(totalResult[0]?.count || 0),
    };
  }

  private getDateRange(timeframe: string): { start?: Date; end?: Date } {
    const now = new Date();
    
    switch (timeframe) {
      case "4W":
        return { start: subWeeks(now, 4), end: now };
      case "8W":
        return { start: subWeeks(now, 8), end: now };
      case "3M":
        return { start: subMonths(now, 3), end: now };
      case "1Y":
        return { start: subYears(now, 1), end: now };
      case "ALL":
        return {};
      default:
        return { start: subWeeks(now, 8), end: now };
    }
  }
}

export const progressRepository = new ProgressRepository();