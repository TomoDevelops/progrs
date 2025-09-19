"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  ProgressDataPoint,
  ExerciseInfo,
} from "@/app/api/dashboard/progress/repository/progress.repository";

export interface ProgressData {
  exerciseId: string | null;
  exerciseName: string | null;
  data: ProgressDataPoint[];
  metric: "weight" | "reps" | "volume";
  timeframe: "2W" | "8W" | "6M" | "1Y";
}

export interface ExercisesData {
  exercises: ExerciseInfo[];
  total: number;
  hasMore: boolean;
}

export const useProgressData = (
  exerciseId?: string,
  timeframe: "2W" | "8W" | "6M" | "1Y" = "8W",
  metric: "weight" | "reps" | "volume" = "volume",
) => {
  return useQuery({
    queryKey: ["progress", exerciseId, timeframe, metric],
    queryFn: async (): Promise<ProgressData> => {
      const params = new URLSearchParams({
        timeframe,
        metric,
      });

      if (exerciseId) {
        params.append("exerciseId", exerciseId);
      }

      const response = await fetch(`/api/dashboard/progress?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch progress data");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch progress data");
      }

      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFavoriteExercises = () => {
  return useQuery({
    queryKey: ["exercises", "favorites"],
    queryFn: async (): Promise<ExercisesData> => {
      const response = await fetch(
        "/api/dashboard/progress/exercises?type=favorites",
      );

      if (!response.ok) {
        throw new Error("Failed to fetch favorite exercises");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch favorite exercises");
      }

      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useAllExercises = (
  search?: string,
  offset: number = 0,
  limit: number = 20,
) => {
  return useQuery({
    queryKey: ["exercises", "all", search, offset, limit],
    queryFn: async (): Promise<ExercisesData> => {
      const params = new URLSearchParams({
        type: "all",
        offset: offset.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(
        `/api/dashboard/progress/exercises?${params}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch exercises");
      }

      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: search !== undefined || offset > 0, // Only fetch when searching or paginating
  });
};
