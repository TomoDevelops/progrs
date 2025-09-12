import { z } from "zod";

// Query parameter schemas
export const WorkoutHistoryQuerySchema = z.object({
  limit: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val >= 1 && val <= 50, {
      message: "Limit must be between 1 and 50",
    }),
  offset: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .refine((val) => val >= 0, {
      message: "Offset must be non-negative",
    }),
});

export const ConsistencyQuerySchema = z.object({
  days: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 30))
    .refine((val) => val >= 1 && val <= 365, {
      message: "Days must be between 1 and 365",
    }),
});

export const TrendingMetricsQuerySchema = z.object({
  limit: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 5))
    .refine((val) => val >= 1 && val <= 20, {
      message: "Limit must be between 1 and 20",
    }),
});

// Response schemas
export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  muscleGroup: z.string(),
  equipment: z.string().nullable(),
});

export const TodayWorkoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  estimatedDuration: z.number().nullable(),
  exercises: z.array(ExerciseSchema),
});

export const WorkoutHistoryItemSchema = z.object({
  id: z.string(),
  routineName: z.string(),
  endedAt: z.date().nullable(),
  totalDuration: z.number().nullable(),
  totalExercises: z.number(),
  totalSets: z.number(),
  notes: z.string().nullable(),
});

export const ConsistencyDataSchema = z.object({
  date: z.string(),
  workoutsCompleted: z.number(),
});

export const TrendingMetricSchema = z.object({
  exerciseName: z.string(),
  muscleGroup: z.string(),
  currentWeight: z.number(),
  previousWeight: z.number(),
  improvement: z.number(),
  improvementPercentage: z.number(),
});

export const SummaryStatsSchema = z.object({
  totalWorkouts: z.number(),
  totalExercises: z.number(),
  totalSets: z.number(),
  averageDuration: z.number(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  totalWeightLifted: z.number(),
});

export const DashboardOverviewSchema = z.object({
  todayWorkout: TodayWorkoutSchema.nullable(),
  recentHistory: z.array(WorkoutHistoryItemSchema),
  weeklyConsistency: z.array(ConsistencyDataSchema),
  trendingMetrics: z.array(TrendingMetricSchema),
  summaryStats: SummaryStatsSchema,
});

// API Response schemas
export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.string().optional(),
});

// Type exports
export type WorkoutHistoryQuery = z.infer<typeof WorkoutHistoryQuerySchema>;
export type ConsistencyQuery = z.infer<typeof ConsistencyQuerySchema>;
export type TrendingMetricsQuery = z.infer<typeof TrendingMetricsQuerySchema>;
export type TodayWorkout = z.infer<typeof TodayWorkoutSchema>;
export type WorkoutHistoryItem = z.infer<typeof WorkoutHistoryItemSchema>;
export type ConsistencyData = z.infer<typeof ConsistencyDataSchema>;
export type TrendingMetric = z.infer<typeof TrendingMetricSchema>;
export type SummaryStats = z.infer<typeof SummaryStatsSchema>;
export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
