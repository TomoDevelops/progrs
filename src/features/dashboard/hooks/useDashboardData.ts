"use client";

import { useQuery } from "@tanstack/react-query";
import {
  SummaryStats,
  TodayWorkout,
  WorkoutHistoryItem,
  ConsistencyData,
  TrendingMetric,
} from "@/app/api/dashboard/schemas/dashboard.schemas";

// API client functions
const fetchDashboardStats = async (): Promise<SummaryStats> => {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
};

const fetchTodayWorkout = async (): Promise<TodayWorkout> => {
  const response = await fetch("/api/dashboard/today");
  if (!response.ok) {
    throw new Error(`Failed to fetch today's workout: ${response.statusText}`);
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

const fetchTrendingMetrics = async (
  period?: string,
): Promise<TrendingMetric[]> => {
  const url = new URL("/api/dashboard/metrics", window.location.origin);
  if (period) {
    url.searchParams.set("period", period);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch trending metrics: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
};

// React Query hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTodayWorkout = () => {
  return useQuery({
    queryKey: ["dashboard", "today"],
    queryFn: fetchTodayWorkout,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWorkoutHistory = (limit?: number) => {
  return useQuery({
    queryKey: ["dashboard", "history", limit],
    queryFn: () => fetchWorkoutHistory(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useConsistencyData = (days?: number) => {
  return useQuery({
    queryKey: ["dashboard", "consistency", days],
    queryFn: () => fetchConsistencyData(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTrendingMetrics = (period?: string) => {
  return useQuery({
    queryKey: ["dashboard", "metrics", period],
    queryFn: () => fetchTrendingMetrics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Combined hook for all dashboard data
export const useDashboardData = () => {
  const stats = useDashboardStats();
  const today = useTodayWorkout();
  const history = useWorkoutHistory(10); // Default to 10 recent workouts
  const consistency = useConsistencyData(30); // Default to 30 days
  const metrics = useTrendingMetrics("week"); // Default to weekly metrics

  return {
    stats,
    today,
    history,
    consistency,
    metrics,
    isLoading:
      stats.isLoading ||
      today.isLoading ||
      history.isLoading ||
      consistency.isLoading ||
      metrics.isLoading,
    isError:
      stats.isError ||
      today.isError ||
      history.isError ||
      consistency.isError ||
      metrics.isError,
    error:
      stats.error ||
      today.error ||
      history.error ||
      consistency.error ||
      metrics.error,
  };
};
