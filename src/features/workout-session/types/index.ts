import { z } from "zod";

// Workout session types
export interface WorkoutSessionExercise {
  id: string;
  exerciseId: string | null;
  name: string;
  orderIndex: number;
  muscleGroup: string | null;
  equipment: string | null;
  targetWeight: number | null;
  minReps: number | null;
  maxReps: number | null;
  restTime: number | null;
  sets: WorkoutSessionSet[];
}

export interface WorkoutSessionSet {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number;
  isCompleted: boolean;
}

export interface WorkoutSession {
  id: string;
  name: string;
  routineName: string | null;
  startedAt: Date;
  endedAt: Date | null;
  totalDuration: number | null;
  currentDuration: number | null;
  estimatedDuration: number | null;
  notes: string | null;
  exercises: WorkoutSessionExercise[];
  isActive: boolean;
}

// API request/response types
export interface CreateSessionRequest {
  action: "create";
  routineId: string;
  name: string;
}

export interface UpdateSetRequest {
  action: "updateSet";
  sessionExerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
}

export interface FinishSessionRequest {
  action: "finish";
  notes?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

// Validation schemas
export const updateSetSchema = z.object({
  sessionExerciseId: z.string().min(1, "Session exercise ID is required"),
  setNumber: z.number().min(1, "Set number must be at least 1"),
  weight: z
    .number()
    .min(0, "Weight cannot be negative")
    .max(1000, "Weight cannot exceed 1000"),
  reps: z
    .number()
    .min(1, "Reps must be at least 1")
    .max(100, "Reps cannot exceed 100"),
  isNewSet: z.boolean().optional(),
});

export const finishSessionSchema = z.object({
  notes: z.string().optional(),
});

export type UpdateSetData = z.infer<typeof updateSetSchema>;
export type FinishSessionData = z.infer<typeof finishSessionSchema>;
