"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { GenerateWorkoutRequest, GeneratedWorkout } from "@/features/ai-workouts/schemas/ai-workout.schemas";

interface UseWorkoutGenerationReturn {
  generateWorkout: (request: GenerateWorkoutRequest) => Promise<GeneratedWorkout>;
  isLoading: boolean;
  error: string | null;
}

export function useWorkoutGeneration(): UseWorkoutGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = async (request: GenerateWorkoutRequest): Promise<GeneratedWorkout> => {
    setIsLoading(true);
    setError(null);

    try {
      const idempotencyKey = uuidv4();
      
      const response = await fetch("/api/ai-workouts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        switch (response.status) {
          case 400:
            throw new Error(errorData.message || "Invalid workout parameters. Please check your selections.");
          case 409:
            throw new Error("Duplicate request detected. Please try again.");
          case 429:
            throw new Error("Too many requests. Please wait a moment before trying again.");
          case 500:
            throw new Error(errorData.message || "Failed to generate workout. Please try again.");
          default:
            throw new Error("An unexpected error occurred. Please try again.");
        }
      }

      const data = await response.json();
      
      if (!data.routine) {
        throw new Error("Invalid response format from server.");
      }

      // Transform the API response to match our GeneratedWorkout schema
      const generatedWorkout: GeneratedWorkout = {
        id: data.blueprintId || uuidv4(),
        name: data.routine.title || "Custom Workout",
        description: `Generated workout with ${data.routine.exercises?.length || 0} exercises`,
        estimatedDuration: Math.round((data.routine.estimatedDurationSec || 0) / 60),
        exercises: (data.routine.exercises || []).map((exercise: {
          exerciseId?: string;
          sets?: number;
          repsMin?: number;
          repsMax?: number;
          restSeconds?: number;
          tempo?: string;
          orderIndex?: number;
        }, index: number) => ({
          id: exercise.exerciseId || `exercise-${index}`,
          name: exercise.exerciseId?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || `Exercise ${index + 1}`,
          muscleGroup: "unknown", // API doesn't provide this, could be inferred
          equipment: "bodyweight", // Default, could be mapped from exercise data
          sets: exercise.sets || 1,
          minReps: exercise.repsMin,
          maxReps: exercise.repsMax,
          targetWeight: undefined,
          restTime: exercise.restSeconds || 60,
          notes: exercise.tempo ? `Tempo: ${exercise.tempo}` : undefined,
          orderIndex: exercise.orderIndex || index,
          duration: undefined,
          distance: undefined,
        })),
        totalVolume: undefined,
        difficulty: request.fitnessLevel,
        tags: data.routine.source ? [data.routine.source] : undefined,
        createdAt: new Date().toISOString(),
        specHash: data.cache?.specHash || "",
        fromCache: data.cache?.hit || false,
      };

      return generatedWorkout;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateWorkout,
    isLoading,
    error,
  };
}