import { getDb } from "@/shared/db/database";
import {
  aiWorkoutBlueprints,
  aiGenerationRequests,
  exercises,
} from "@/shared/db/schema/app-schema";
import {
  GenerateWorkoutRequest,
  GeneratedWorkout,
  GeneratedExercise,
  EquipmentType,
} from "../schemas/ai-workout.schemas";
import { eq, desc, inArray } from "drizzle-orm";
import crypto from "crypto";
import { executeWithRetry } from "@/shared/utils/db-retry";

// New interface for database-compatible workout structure
interface WorkoutRoutineData {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  estimatedDuration: number | null;
  isActive: boolean;
  exercises: RoutineExerciseData[];
}

interface RoutineExerciseData {
  id: string;
  routineId: string;
  exerciseId: string;
  orderIndex: number;
  sets: number;
  minReps: number | null;
  maxReps: number | null;
  targetWeight: string | null; // decimal as string
  restTime: number | null;
  notes: string | null;
}

interface GenerateWorkoutParams {
  userId: string;
  request: GenerateWorkoutRequest;
  idempotencyKey?: string | null;
}

class AiWorkoutGenerationService {
  private db = getDb();

  /**
   * Get existing workout by idempotency key
   */
  async getByIdempotencyKey(
    idempotencyKey: string,
    userId: string,
  ): Promise<GeneratedWorkout | null> {
    try {
      const existingRequest = await this.db
        .select()
        .from(aiGenerationRequests)
        .where(eq(aiGenerationRequests.idempotencyKey, idempotencyKey))
        .limit(1);

      if (existingRequest.length === 0) {
        return null;
      }

      const request = existingRequest[0];

      // Verify the request belongs to the same user
      if (request.userId !== userId) {
        throw new Error("Idempotency key conflict");
      }

      // Return existing result if completed
      if (request.status === "completed" && request.result) {
        return JSON.parse(request.result) as GeneratedWorkout;
      }

      return null;
    } catch (error) {
      console.error("Error fetching by idempotency key:", error);
      throw error;
    }
  }

  /**
   * Generate a workout based on user preferences
   */
  async generateWorkout(
    params: GenerateWorkoutParams,
  ): Promise<GeneratedWorkout> {
    const { userId, request, idempotencyKey } = params;

    try {
      // Generate spec hash for caching
      const specHash = this.generateSpecHash(request);

      // Check for existing blueprint if caching is allowed
      if (request.allowCachedResults && !request.regenerate) {
        const cachedBlueprint = await this.getCachedBlueprint(specHash);
        if (cachedBlueprint) {
          await this.updateBlueprintUsage(cachedBlueprint.id);
          // Convert cached blueprint to GeneratedWorkout with proper exercise details
          return await this.convertCachedBlueprintToWorkout(cachedBlueprint, specHash);
        }
      }

      // Create generation request record
      const requestId = crypto.randomUUID();
      await this.createGenerationRequest({
        id: requestId,
        userId,
        specHash,
        requestData: JSON.stringify(request),
        status: "processing",
        idempotencyKey: idempotencyKey || undefined,
      });

      try {
        // Generate new workout using AI
        const generatedWorkout = await this.generateNewWorkout(
          request,
          specHash,
        );

        // Cache the generated workout for future use
        const blueprintId = await this.cacheBlueprint(specHash, generatedWorkout, userId);

        // Update request status with retry
        await executeWithRetry(async () => {
          await this.db
            .update(aiGenerationRequests)
            .set({
              status: "completed",
              blueprintId,
              completedAt: new Date(),
            })
            .where(eq(aiGenerationRequests.id, requestId));
        });

        return generatedWorkout;
      } catch (error) {
        // Update request with error (with retry)
        await executeWithRetry(async () => {
          await this.db
            .update(aiGenerationRequests)
            .set({
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error",
              completedAt: new Date(),
            })
            .where(eq(aiGenerationRequests.id, requestId));
        });
        throw error;
      }
    } catch (error) {
      console.error("Workout generation failed:", error);
      throw new Error("AI_SERVICE_ERROR");
    }
  }

  /**
   * Generate a unique hash for the workout specification
   */
  private generateSpecHash(request: GenerateWorkoutRequest): string {
    const normalizedRequest = {
      fitnessLevel: request.fitnessLevel,
      availableEquipment: [...request.availableEquipment].sort(),
      targetMuscleGroups: request.targetMuscleGroups
        ? [...request.targetMuscleGroups].sort()
        : undefined,
      workoutType: request.workoutType,
      targetDuration: request.targetDuration,
      intensity: request.intensity,
      excludeExercises: request.excludeExercises
        ? [...request.excludeExercises].sort()
        : undefined,
      includeExercises: request.includeExercises
        ? [...request.includeExercises].sort()
        : undefined,
    };

    const hashInput = JSON.stringify(normalizedRequest);
    return crypto.createHash("sha256").update(hashInput).digest("hex");
  }

  /**
   * Get cached blueprint by spec hash
   */
  private async getCachedBlueprint(specHash: string) {
    const blueprints = await this.db
      .select()
      .from(aiWorkoutBlueprints)
      .where(eq(aiWorkoutBlueprints.specHash, specHash))
      .orderBy(desc(aiWorkoutBlueprints.lastUsedAt))
      .limit(1);

    return blueprints[0] || null;
  }

  /**
   * Convert cached blueprint data to GeneratedWorkout with exercise details
   */
  private async convertCachedBlueprintToWorkout(
    blueprint: typeof aiWorkoutBlueprints.$inferSelect,
    specHash: string,
  ): Promise<GeneratedWorkout> {
    const routineData = JSON.parse(blueprint.routineData) as WorkoutRoutineData;
    
    // Get exercise details for each routine exercise
    const exerciseIds = routineData.exercises.map(e => e.exerciseId);
    const exerciseDetails = await this.db
      .select()
      .from(exercises)
      .where(inArray(exercises.id, exerciseIds));
    
    // Create a map for quick lookup
    const exerciseMap = new Map(exerciseDetails.map(e => [e.id, e]));
    
    // Convert to GeneratedWorkout with proper exercise details
    const generatedExercises: GeneratedExercise[] = routineData.exercises.map(
      (routineExercise) => {
        const exerciseDetail = exerciseMap.get(routineExercise.exerciseId);
        return {
          id: routineExercise.exerciseId,
          name: exerciseDetail?.name || "Unknown Exercise",
          muscleGroup: exerciseDetail?.muscleGroup || "unknown",
          equipment: (exerciseDetail?.equipment || "bodyweight") as EquipmentType,
          sets: routineExercise.sets,
          minReps: routineExercise.minReps || undefined,
          maxReps: routineExercise.maxReps || undefined,
          targetWeight: routineExercise.targetWeight
            ? parseFloat(routineExercise.targetWeight)
            : undefined,
          restTime: routineExercise.restTime || 60,
          notes: routineExercise.notes || undefined,
          orderIndex: routineExercise.orderIndex,
        };
      },
    );

    return {
      id: routineData.id,
      name: routineData.name,
      description: routineData.description || undefined,
      estimatedDuration: routineData.estimatedDuration || 0,
      exercises: generatedExercises,
      difficulty: "beginner", // Default, should be stored separately
      tags: [],
      createdAt: new Date().toISOString(),
      specHash,
      fromCache: true,
    };
  }

  /**
   * Update blueprint usage statistics
   */
  private async updateBlueprintUsage(blueprintId: string) {
    // First get the current usage count
    const current = await this.db
      .select({ usageCount: aiWorkoutBlueprints.usageCount })
      .from(aiWorkoutBlueprints)
      .where(eq(aiWorkoutBlueprints.id, blueprintId))
      .limit(1);

    const currentCount = current[0]?.usageCount || 0;

    await this.db
      .update(aiWorkoutBlueprints)
      .set({
        lastUsedAt: new Date(),
        usageCount: currentCount + 1,
      })
      .where(eq(aiWorkoutBlueprints.id, blueprintId));
  }

  /**
   * Generate a new workout using AI (enhanced implementation)
   */
  private async generateNewWorkout(
    request: GenerateWorkoutRequest,
    specHash: string,
  ): Promise<GeneratedWorkout> {
    // TODO: Integrate with actual AI service (OpenAI, Claude, etc.)
    // TODO: After AI integration, all below can be deleted
    // TODO: Have AI generate in the form of workout_routine so they can be easily used as cards
    // This is an enhanced placeholder implementation with better logic

    // Get available exercises from database with equipment filtering
    const availableExercises = await this.getFilteredExercises(request);

    // Calculate time budget and exercise distribution
    const timeBudget = this.calculateTimeBudget(request);

    // Generate exercises based on workout type and muscle group targeting
    const generatedExercises = await this.generateExerciseSelection(
      request,
      availableExercises,
      timeBudget,
    );

    // Calculate total estimated duration based on actual exercises
    const actualDuration = this.calculateActualDuration(generatedExercises);

    const workout: GeneratedWorkout = {
      id: crypto.randomUUID(),
      name: this.generateWorkoutName(request),
      description: this.generateWorkoutDescription(request),
      estimatedDuration: actualDuration,
      exercises: generatedExercises,
      difficulty: request.fitnessLevel,
      tags: this.generateWorkoutTags(request),
      createdAt: new Date().toISOString(),
      specHash,
      fromCache: false,
    };

    return workout;
  }

  /**
   * Convert GeneratedWorkout to database-compatible WorkoutRoutineData
   */
  private convertToWorkoutRoutineData(
    workout: GeneratedWorkout,
    userId: string,
  ): WorkoutRoutineData {
    const routineExercises: RoutineExerciseData[] = workout.exercises.map(
      (exercise) => ({
        id: crypto.randomUUID(),
        routineId: workout.id,
        exerciseId: exercise.id,
        orderIndex: exercise.orderIndex,
        sets: exercise.sets,
        minReps: exercise.minReps || null,
        maxReps: exercise.maxReps || null,
        targetWeight: exercise.targetWeight?.toString() || null,
        restTime: exercise.restTime || null,
        notes: exercise.notes || null,
      }),
    );

    return {
      id: workout.id,
      userId,
      name: workout.name,
      description: workout.description || null,
      estimatedDuration: workout.estimatedDuration,
      isActive: true,
      exercises: routineExercises,
    };
  }

  /**
   * Convert WorkoutRoutineData back to GeneratedWorkout for API responses
   */
  private convertToGeneratedWorkout(
    routineData: WorkoutRoutineData,
    specHash: string,
    fromCache: boolean = false,
  ): GeneratedWorkout {
    const exercises: GeneratedExercise[] = routineData.exercises.map(
      (routineExercise) => ({
        id: routineExercise.exerciseId,
        name: "", // Will be populated from exercises table
        muscleGroup: "unknown", // Will be populated from exercises table
        equipment: "bodyweight" as EquipmentType, // Will be populated from exercises table
        sets: routineExercise.sets,
        minReps: routineExercise.minReps || undefined,
        maxReps: routineExercise.maxReps || undefined,
        targetWeight: routineExercise.targetWeight
          ? parseFloat(routineExercise.targetWeight)
          : undefined,
        restTime: routineExercise.restTime || 60,
        notes: routineExercise.notes || undefined,
        orderIndex: routineExercise.orderIndex,
      }),
    );

    return {
      id: routineData.id,
      name: routineData.name,
      description: routineData.description || undefined,
      estimatedDuration: routineData.estimatedDuration || 0,
      exercises,
      difficulty: "beginner", // Default, should be stored separately
      tags: [],
      createdAt: new Date().toISOString(),
      specHash,
      fromCache,
    };
  }

  /**
   * Get exercises filtered by equipment and preferences
   */
  private async getFilteredExercises(
    request: GenerateWorkoutRequest,
  ): Promise<(typeof exercises.$inferSelect)[]> {
    // Get all public exercises
    let availableExercises = await this.db
      .select()
      .from(exercises)
      .where(eq(exercises.isPublic, true));

    // Filter by equipment availability
    availableExercises = availableExercises.filter((exercise) => {
      if (!exercise.equipment) return true; // Assume bodyweight if no equipment specified
      return (
        request.availableEquipment.includes(
          exercise.equipment as EquipmentType,
        ) || exercise.equipment === "bodyweight"
      );
    });

    // Filter by muscle groups if specified
    if (request.targetMuscleGroups && request.targetMuscleGroups.length > 0) {
      availableExercises = availableExercises.filter((exercise) => {
        if (!exercise.muscleGroup) return false;
        return request.targetMuscleGroups!.some((target) =>
          exercise.muscleGroup?.toLowerCase().includes(target.toLowerCase()),
        );
      });
    }

    // Exclude specific exercises if requested
    if (request.excludeExercises && request.excludeExercises.length > 0) {
      availableExercises = availableExercises.filter(
        (exercise) =>
          !request.excludeExercises!.includes(exercise.name.toLowerCase()),
      );
    }

    return availableExercises;
  }

  /**
   * Calculate time budget for different parts of the workout
   */
  private calculateTimeBudget(request: GenerateWorkoutRequest): {
    warmup: number;
    mainWork: number;
    cooldown: number;
    exerciseCount: number;
  } {
    const totalMinutes = request.targetDuration;

    // Allocate time based on workout type
    switch (request.workoutType) {
      case "strength":
        return {
          warmup: Math.max(5, totalMinutes * 0.1),
          mainWork: totalMinutes * 0.8,
          cooldown: Math.max(5, totalMinutes * 0.1),
          exerciseCount: Math.floor(totalMinutes / 8), // ~8 minutes per exercise
        };
      case "cardio":
        return {
          warmup: Math.max(3, totalMinutes * 0.05),
          mainWork: totalMinutes * 0.9,
          cooldown: Math.max(2, totalMinutes * 0.05),
          exerciseCount: Math.floor(totalMinutes / 12), // ~12 minutes per exercise
        };
      case "hiit":
        return {
          warmup: Math.max(5, totalMinutes * 0.1),
          mainWork: totalMinutes * 0.8,
          cooldown: Math.max(5, totalMinutes * 0.1),
          exerciseCount: Math.floor(totalMinutes / 6), // ~6 minutes per exercise
        };
      default:
        return {
          warmup: Math.max(5, totalMinutes * 0.1),
          mainWork: totalMinutes * 0.8,
          cooldown: Math.max(5, totalMinutes * 0.1),
          exerciseCount: Math.floor(totalMinutes / 10), // ~10 minutes per exercise
        };
    }
  }

  /**
   * Generate exercise selection based on request parameters
   */
  private async generateExerciseSelection(
    request: GenerateWorkoutRequest,
    availableExercises: (typeof exercises.$inferSelect)[],
    timeBudget: {
      warmup: number;
      mainWork: number;
      cooldown: number;
      exerciseCount: number;
    },
  ): Promise<GeneratedExercise[]> {
    const generatedExercises: GeneratedExercise[] = [];
    const exerciseCount = Math.min(
      timeBudget.exerciseCount,
      availableExercises.length,
    );

    // Ensure we have exercises to work with
    if (availableExercises.length === 0) {
      throw new Error("No suitable exercises found for the given criteria");
    }

    // Include requested exercises first
    if (request.includeExercises && request.includeExercises.length > 0) {
      const includedExercises = availableExercises.filter((exercise) =>
        request.includeExercises!.some((included) =>
          exercise.name.toLowerCase().includes(included.toLowerCase()),
        ),
      );

      for (
        let i = 0;
        i < Math.min(includedExercises.length, exerciseCount);
        i++
      ) {
        const exercise = includedExercises[i];
        generatedExercises.push(
          this.createExerciseFromTemplate(exercise, request, i),
        );
      }
    }

    // Fill remaining slots with balanced selection
    const remainingSlots = exerciseCount - generatedExercises.length;
    const usedExerciseIds = new Set(generatedExercises.map((e) => e.id));

    // Try to balance muscle groups
    const muscleGroupCounts = new Map<string, number>();

    for (let i = 0; i < remainingSlots && availableExercises.length > 0; i++) {
      // Find exercise that balances muscle groups
      const exercise = this.selectBalancedExercise(
        availableExercises,
        usedExerciseIds,
        muscleGroupCounts,
        request,
      );

      if (exercise) {
        generatedExercises.push(
          this.createExerciseFromTemplate(
            exercise,
            request,
            generatedExercises.length,
          ),
        );
        usedExerciseIds.add(exercise.id);

        const muscleGroup = exercise.muscleGroup || "unknown";
        muscleGroupCounts.set(
          muscleGroup,
          (muscleGroupCounts.get(muscleGroup) || 0) + 1,
        );
      }
    }

    return generatedExercises;
  }

  /**
   * Select exercise that balances muscle groups
   */
  private selectBalancedExercise(
    availableExercises: (typeof exercises.$inferSelect)[],
    usedExerciseIds: Set<string>,
    muscleGroupCounts: Map<string, number>,
    request: GenerateWorkoutRequest,
  ): typeof exercises.$inferSelect | null {
    // Filter out already used exercises
    const unusedExercises = availableExercises.filter(
      (e) => !usedExerciseIds.has(e.id),
    );

    if (unusedExercises.length === 0) return null;

    // If targeting specific muscle groups, prioritize those
    if (request.targetMuscleGroups && request.targetMuscleGroups.length > 0) {
      const targetedExercises = unusedExercises.filter((exercise) => {
        const muscleGroup = exercise.muscleGroup || "unknown";
        return request.targetMuscleGroups!.some((target) =>
          muscleGroup.toLowerCase().includes(target.toLowerCase()),
        );
      });

      if (targetedExercises.length > 0) {
        // Select from targeted exercises, preferring less used muscle groups
        return targetedExercises.sort((a, b) => {
          const aCount = muscleGroupCounts.get(a.muscleGroup || "unknown") || 0;
          const bCount = muscleGroupCounts.get(b.muscleGroup || "unknown") || 0;
          return aCount - bCount;
        })[0];
      }
    }

    // Otherwise, select exercise with least used muscle group
    return unusedExercises.sort((a, b) => {
      const aCount = muscleGroupCounts.get(a.muscleGroup || "unknown") || 0;
      const bCount = muscleGroupCounts.get(b.muscleGroup || "unknown") || 0;
      return aCount - bCount;
    })[0];
  }

  /**
   * Create exercise from database template with proper parameters
   */
  private createExerciseFromTemplate(
    exercise: typeof exercises.$inferSelect,
    request: GenerateWorkoutRequest,
    orderIndex: number,
  ): GeneratedExercise {
    const sets = this.getSetsForLevel(request.fitnessLevel);
    const reps = this.getRepsForLevel(request.fitnessLevel);
    const restTime = this.getRestTimeForLevel(request.fitnessLevel);

    return {
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup || "unknown",
      equipment: (exercise.equipment || "bodyweight") as EquipmentType,
      sets,
      minReps: reps.min,
      maxReps: reps.max,
      restTime,
      orderIndex,
      notes: this.generateExerciseNotes(exercise, request),
    };
  }

  /**
   * Calculate actual workout duration based on exercises
   */
  private calculateActualDuration(exercises: GeneratedExercise[]): number {
    let totalTime = 0;

    exercises.forEach((exercise) => {
      // Estimate time per set (work + rest)
      const workTimePerSet = 45; // seconds
      const totalWorkTime = exercise.sets * workTimePerSet;
      const totalRestTime = (exercise.sets - 1) * exercise.restTime;

      totalTime += (totalWorkTime + totalRestTime) / 60; // convert to minutes
    });

    // Add warmup and cooldown
    totalTime += 10; // 5 min warmup + 5 min cooldown

    return Math.round(totalTime);
  }

  /**
   * Generate workout name based on request
   */
  private generateWorkoutName(request: GenerateWorkoutRequest): string {
    const typeNames = {
      strength: "Strength Training",
      cardio: "Cardio Blast",
      hiit: "HIIT Circuit",
      flexibility: "Flexibility Flow",
      mixed: "Full Body Workout",
    };

    const baseName = typeNames[request.workoutType] || "Custom Workout";
    const duration = `${request.targetDuration}min`;
    const level =
      request.fitnessLevel.charAt(0).toUpperCase() +
      request.fitnessLevel.slice(1);

    return `${level} ${baseName} (${duration})`;
  }

  /**
   * Generate workout description
   */
  private generateWorkoutDescription(request: GenerateWorkoutRequest): string {
    const muscleGroups = request.targetMuscleGroups?.join(", ") || "full body";
    const equipment = request.availableEquipment.join(", ");

    return (
      `A ${request.fitnessLevel} level ${request.workoutType} workout targeting ${muscleGroups}. ` +
      `Uses ${equipment} equipment and takes approximately ${request.targetDuration} minutes to complete.`
    );
  }

  /**
   * Generate workout tags
   */
  private generateWorkoutTags(request: GenerateWorkoutRequest): string[] {
    const tags: string[] = [
      request.workoutType,
      request.fitnessLevel,
      ...request.availableEquipment,
    ];

    if (request.targetMuscleGroups) {
      tags.push(...request.targetMuscleGroups.map((group) => group as string));
    }

    if (request.intensity) {
      tags.push(request.intensity as string);
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Generate exercise-specific notes
   */
  private generateExerciseNotes(
    exercise: typeof exercises.$inferSelect,
    request: GenerateWorkoutRequest,
  ): string {
    const notes = [`Designed for ${request.fitnessLevel} level`];

    if (request.intensity) {
      notes.push(`${request.intensity} intensity`);
    }

    if (request.limitations && request.limitations.length > 0) {
      notes.push("Consider any physical limitations");
    }

    return notes.join(". ") + ".";
  }

  /**
   * Cache generated workout blueprint
   */
  private async cacheBlueprint(
    specHash: string,
    workout: GeneratedWorkout,
    userId: string,
  ): Promise<string> {
    // Convert to database-compatible format before caching
    const routineData = this.convertToWorkoutRoutineData(workout, userId);
    
    const blueprintId = crypto.randomUUID();

    await this.db.insert(aiWorkoutBlueprints).values({
      id: blueprintId,
      specHash,
      routineData: JSON.stringify(routineData),
      createdAt: new Date(),
      lastUsedAt: new Date(),
      usageCount: 1,
    });

    return blueprintId;
  }

  /**
   * Create generation request record
   */
  private async createGenerationRequest(data: {
    id: string;
    userId: string;
    specHash: string;
    requestData: string;
    status: string;
    idempotencyKey?: string;
  }) {
    await this.db.insert(aiGenerationRequests).values({
      ...data,
      createdAt: new Date(),
    });
  }

  /**
   * Update generation request status
   */
  private async updateGenerationRequest(
    requestId: string,
    updates: {
      status?: string;
      blueprintId?: string;
      error?: string;
      completedAt?: Date;
    },
  ) {
    await this.db
      .update(aiGenerationRequests)
      .set(updates)
      .where(eq(aiGenerationRequests.id, requestId));
  }

  /**
   * Helper methods for workout generation
   */
  private getSetsForLevel(level: string): number {
    switch (level) {
      case "beginner":
        return 2;
      case "intermediate":
        return 3;
      case "advanced":
        return 4;
      default:
        return 3;
    }
  }

  private getRepsForLevel(level: string): { min: number; max: number } {
    switch (level) {
      case "beginner":
        return { min: 8, max: 12 };
      case "intermediate":
        return { min: 10, max: 15 };
      case "advanced":
        return { min: 12, max: 20 };
      default:
        return { min: 10, max: 15 };
    }
  }

  private getRestTimeForLevel(level: string): number {
    switch (level) {
      case "beginner":
        return 90; // 90 seconds
      case "intermediate":
        return 60; // 60 seconds
      case "advanced":
        return 45; // 45 seconds
      default:
        return 60;
    }
  }
}

// Export singleton instance
export const aiWorkoutGenerationService = new AiWorkoutGenerationService();
