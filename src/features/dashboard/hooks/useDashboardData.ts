"use client";

import { useApiQuery } from "@/shared/hooks/useApiQuery";
import type {
  SummaryStats,
  WorkoutHistoryItem,
  ConsistencyData,
} from "@/app/api/dashboard/schemas/dashboard.schemas";
import type { TodayWorkoutData } from "@/app/api/dashboard/repository/dashboard.repository";

// React Query hooks
export const useDashboardStats = (enabled: boolean = true) => {
  return useApiQuery<SummaryStats>(
    ["dashboard", "stats"],
    "/dashboard/stats",
    {
      staleTime: 2 * 60 * 1000, // 2 minutes - critical content, fresher data
      gcTime: 10 * 60 * 1000, // 10 minutes cache
      enabled,
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
    },
  );
};

export const useTodayWorkout = (enabled: boolean = true) => {
  const { data, ...rest } = useApiQuery<TodayWorkoutData[]>(
    ["dashboard", "today"],
    "/dashboard/today",
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      enabled,
    },
  );

  return {
    data: data && data.length > 0 ? data[0] : null,
    ...rest,
  };
};

export const useTodayWorkouts = (enabled: boolean = true) => {
  return useApiQuery<TodayWorkoutData[]>(
    ["dashboard", "today-workouts"],
    "/dashboard/today",
    {
      staleTime: 1 * 60 * 1000, // 1 minute - most critical content
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      enabled,
      refetchOnWindowFocus: false,
      // High priority for LCP optimization
      networkMode: "online",
    },
  );
};

export const useWorkoutHistory = (limit?: number, enabled: boolean = true) => {
  const endpoint = limit ? `/dashboard/history?limit=${limit.toString()}` : "/dashboard/history";
  return useApiQuery<WorkoutHistoryItem[]>(
    ["dashboard", "history", limit?.toString() || "all"],
    endpoint,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes - below-the-fold, can be staler
      gcTime: 15 * 60 * 1000, // 15 minutes cache
      enabled,
      refetchOnWindowFocus: false,
    },
  );
};

export const useConsistencyData = (days?: number, enabled: boolean = true) => {
  const endpoint = days ? `/dashboard/consistency?days=${days.toString()}` : "/dashboard/consistency";
  return useApiQuery<ConsistencyData[]>(
    ["dashboard", "consistency", days?.toString() || "all"],
    endpoint,
    {
      staleTime: 15 * 60 * 1000, // 15 minutes - least critical, can be stalest
      gcTime: 20 * 60 * 1000, // 20 minutes cache
      enabled,
      refetchOnWindowFocus: false,
    },
  );
};

// Combined hook for all dashboard data with optimized loading priority
export const useDashboardData = (enabled: boolean = true) => {
  // Priority 1: Above-the-fold content (critical for LCP)
  const todayWorkouts = useTodayWorkouts(enabled);
  const stats = useDashboardStats(enabled);

  // Priority 2: Below-the-fold content (load after critical content)
  const criticalContentLoaded = !todayWorkouts.isLoading && !stats.isLoading;
  const enableBelowFold = enabled && (criticalContentLoaded || !enabled);

  const history = useWorkoutHistory(10, enableBelowFold); // Default to 10 recent workouts
  const consistency = useConsistencyData(30, enableBelowFold); // Default to 30 days

  return {
    stats,
    todayWorkouts,
    history,
    consistency,
    isLoading:
      stats.isLoading ||
      todayWorkouts.isLoading ||
      history.isLoading ||
      consistency.isLoading,
    isError:
      stats.isError ||
      todayWorkouts.isError ||
      history.isError ||
      consistency.isError,
    error:
      stats.error || todayWorkouts.error || history.error || consistency.error,
    // Additional flags for granular loading states
    isCriticalLoading: todayWorkouts.isLoading || stats.isLoading,
    isBelowFoldLoading: history.isLoading || consistency.isLoading,
  };
};
