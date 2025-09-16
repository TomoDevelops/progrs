"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  SummaryStats,
  TodayWorkout,
  WorkoutHistoryItem,
  ConsistencyData,
} from "@/app/api/dashboard/schemas/dashboard.schemas";
import type { TodayWorkoutData } from "@/app/api/dashboard/repository/dashboard.repository";

// API client functions
const fetchDashboardStats = async (): Promise<SummaryStats> => {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
};

const fetchTodayWorkout = async (): Promise<TodayWorkout | null> => {
  const response = await fetch("/api/dashboard/today");
  if (!response.ok) {
    throw new Error(`Failed to fetch today's workout: ${response.statusText}`);
  }
  const result = await response.json();
  // Return first workout for backward compatibility
  return result.data.length > 0 ? result.data[0] : null;
};

const fetchTodayWorkouts = async (): Promise<TodayWorkoutData[]> => {
  const response = await fetch("/api/dashboard/today");
  if (!response.ok) {
    throw new Error(`Failed to fetch today's workouts: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
};

const fetchWorkoutHistory = async (
  limit?: number,
): Promise<WorkoutHistoryItem[]> => {
  const url = new URL("/api/dashboard/history", window.location.origin);
  if (limit) {
    url.searchParams.set("limit", limit.toString());
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch workout history: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
};

const fetchConsistencyData = async (
  days?: number,
): Promise<ConsistencyData[]> => {
  const url = new URL("/api/dashboard/consistency", window.location.origin);
  if (days) {
    url.searchParams.set("days", days.toString());
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch consistency data: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
};

// React Query hooks
export const useDashboardStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes - critical content, fresher data
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    enabled,
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
  });
};

export const useTodayWorkout = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard", "today"],
    queryFn: fetchTodayWorkout,
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled,
  });
};

export const useTodayWorkouts = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard", "today-workouts"],
    queryFn: fetchTodayWorkouts,
    staleTime: 1 * 60 * 1000, // 1 minute - most critical content
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    enabled,
    refetchOnWindowFocus: false,
    // High priority for LCP optimization
    networkMode: 'online',
  });
};

export const useWorkoutHistory = (limit?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard", "history", limit],
    queryFn: () => fetchWorkoutHistory(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes - below-the-fold, can be staler
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useConsistencyData = (days?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard", "consistency", days],
    queryFn: () => fetchConsistencyData(days),
    staleTime: 15 * 60 * 1000, // 15 minutes - least critical, can be stalest
    gcTime: 20 * 60 * 1000, // 20 minutes cache
    enabled,
    refetchOnWindowFocus: false,
  });
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
