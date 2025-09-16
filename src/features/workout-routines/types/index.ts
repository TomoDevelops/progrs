import { z } from "zod";

// Exercise in routine schema
export const routineExerciseSchema = z
  .object({
    exerciseId: z.string().min(1, "Exercise is required"),
    sets: z
      .number()
      .min(1, "At least 1 set is required")
      .max(20, "Maximum 20 sets allowed"),
    minReps: z
      .number()
      .min(1, "Minimum reps must be at least 1")
      .optional()
      .nullable(),
    maxReps: z
      .number()
      .min(1, "Maximum reps must be at least 1")
      .optional()
      .nullable(),
    targetWeight: z.number().min(0, "Weight cannot be negative").optional(),
    restTime: z
      .number()
      .min(60, "Rest time must be at least 1 minute")
      .optional(), // in seconds
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.minReps && data.maxReps) {
        return data.minReps <= data.maxReps;
      }
      return true;
    },
    {
      message: "Minimum reps cannot be greater than maximum reps",
      path: ["maxReps"],
    },
  );

// Schedule schema
export const routineScheduleSchema = z
  .object({
    startDate: z.date(),
    recurrencePattern: z.enum(["daily", "weekly", "one-time"]),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(), // 0 = Sunday, 6 = Saturday
    customPattern: z.string().optional(),
    endDate: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    },
  );

// Main workout routine schema
export const workoutRoutineSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(480, "Duration cannot exceed 8 hours"), // in minutes
  exercises: z
    .array(routineExerciseSchema)
    .min(1, "At least one exercise is required"),
  schedule: routineScheduleSchema.optional(),
});

// Types derived from schemas
export type RoutineExercise = z.infer<typeof routineExerciseSchema>;
export type RoutineSchedule = z.infer<typeof routineScheduleSchema>;
export type WorkoutRoutine = z.infer<typeof workoutRoutineSchema>;

// Form data type (for form state management)
export type WorkoutRoutineFormData = {
  name: string;
  description?: string;
  duration: number;
  exercises: RoutineExercise[];
  schedule?: {
    startDate?: Date;
    recurrencePattern?: "daily" | "weekly" | "one-time";
    daysOfWeek?: number[];
    customPattern?: string;
    endDate?: Date;
  };
};

// API response types
export type CreateWorkoutRoutineResponse = {
  success: boolean;
  data?: {
    id: string;
    name: string;
    createdAt: string;
  };
  error?: string;
};

// Exercise type (for exercise selection)
export type Exercise = {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
};
