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
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled,
  });
};

export const useWorkoutHistory = (limit?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard", "history", limit],
    queryFn: () => fetchWorkoutHistory(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });
};

export const useConsistencyData = (days?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard", "consistency", days],
    queryFn: () => fetchConsistencyData(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled,
  });
};

// Combined hook for all dashboard data
export const useDashboardData = (enabled: boolean = true) => {
  const stats = useDashboardStats(enabled);
  const today = useTodayWorkout(enabled);
  const history = useWorkoutHistory(10, enabled); // Default to 10 recent workouts
  const consistency = useConsistencyData(30, enabled); // Default to 30 days

  return {
    stats,
    today,
    history,
    consistency,
    isLoading:
      stats.isLoading ||
      today.isLoading ||
      history.isLoading ||
      consistency.isLoading,
    isError:
      stats.isError || today.isError || history.isError || consistency.isError,
    error: stats.error || today.error || history.error || consistency.error,
  };
};
