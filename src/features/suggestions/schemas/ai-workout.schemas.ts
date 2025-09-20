import { z } from "zod";

// Equipment types based on the spec
export const equipmentSchema = z.enum([
  "bodyweight",
  "dumbbells",
  "barbell",
  "resistance_bands",
  "kettlebells",
  "cable_machine",
  "pull_up_bar",
  "bench",
  "squat_rack",
  "cardio_machine",
]);

// Fitness level mapping
export const fitnessLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

// Workout type preferences
export const workoutTypeSchema = z.enum([
  "strength",
  "cardio",
  "hiit",
  "flexibility",
  "mixed",
]);

// Muscle group targeting
export const muscleGroupSchema = z.enum([
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "glutes",
  "core",
  "full_body",
]);

// Request schema for generating workouts
export const generateWorkoutRequestSchema = z.object({
  // User preferences
  fitnessLevel: fitnessLevelSchema,
  availableEquipment: z.array(equipmentSchema).min(1, "At least one equipment type required"),
  targetMuscleGroups: z.array(muscleGroupSchema).optional(),
  workoutType: workoutTypeSchema,
  
  // Time and intensity constraints
  targetDuration: z.number().min(10).max(180), // 10 minutes to 3 hours
  intensity: z.enum(["low", "moderate", "high"]).optional(),
  
  // Specific requirements
  excludeExercises: z.array(z.string()).optional(),
  includeExercises: z.array(z.string()).optional(),
  
  // Additional preferences
  focusAreas: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  
  // Caching and generation hints
  allowCachedResults: z.boolean().default(true),
  regenerate: z.boolean().default(false),
});

// Exercise schema for the generated workout
export const generatedExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  muscleGroup: z.string(),
  equipment: equipmentSchema,
  sets: z.number().min(1),
  minReps: z.number().min(1).optional(),
  maxReps: z.number().min(1).optional(),
  targetWeight: z.number().optional(),
  restTime: z.number().min(0), // in seconds
  notes: z.string().optional(),
  orderIndex: z.number().min(0),
  duration: z.number().optional(), // for time-based exercises
  distance: z.number().optional(), // for cardio exercises
});

// Generated workout response schema
export const generatedWorkoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  estimatedDuration: z.number(), // in minutes
  exercises: z.array(generatedExerciseSchema),
  totalVolume: z.number().optional(),
  difficulty: fitnessLevelSchema,
  tags: z.array(z.string()).optional(),
  createdAt: z.string(),
  specHash: z.string(),
  fromCache: z.boolean().default(false),
});

// Feedback schema for workout quality
export const workoutFeedbackSchema = z.object({
  workoutId: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.enum(["too_easy", "too_hard", "just_right", "too_long", "too_short"]),
  comments: z.string().optional(),
  completedExercises: z.array(z.string()).optional(),
  skippedExercises: z.array(z.string()).optional(),
});

// Blueprint cache schema
export const workoutBlueprintSchema = z.object({
  id: z.string(),
  specHash: z.string(),
  routineData: z.string(), // JSON string
  createdAt: z.string(),
  lastUsedAt: z.string(),
  usageCount: z.number(),
});

// Generation request tracking schema
export const generationRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  specHash: z.string(),
  blueprintId: z.string().optional(),
  requestData: z.string(), // JSON string
  status: z.enum(["pending", "processing", "completed", "failed"]),
  error: z.string().optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

// Type exports
export type GenerateWorkoutRequest = z.infer<typeof generateWorkoutRequestSchema>;
export type GeneratedExercise = z.infer<typeof generatedExerciseSchema>;
export type GeneratedWorkout = z.infer<typeof generatedWorkoutSchema>;
export type WorkoutFeedback = z.infer<typeof workoutFeedbackSchema>;
export type WorkoutBlueprint = z.infer<typeof workoutBlueprintSchema>;
export type GenerationRequest = z.infer<typeof generationRequestSchema>;
export type EquipmentType = z.infer<typeof equipmentSchema>;
export type FitnessLevel = z.infer<typeof fitnessLevelSchema>;
export type WorkoutType = z.infer<typeof workoutTypeSchema>;
export type MuscleGroup = z.infer<typeof muscleGroupSchema>;