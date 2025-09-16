"use client";

import { useQuery } from "@tanstack/react-query";
import type { WeeklyStats } from "@/app/api/dashboard/repository/dashboard.repository";

interface WeeklyStatsResponse {
  currentWeek: WeeklyStats;
  lastWeek: WeeklyStats;
}

interface UseWeeklyStatsReturn {
  currentWeek: WeeklyStats | undefined;
  lastWeek: WeeklyStats | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useWeeklyStats(): UseWeeklyStatsReturn {
  const { data, isLoading, error } = useQuery<WeeklyStatsResponse>({
    queryKey: ["weekly-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/weekly-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch weekly stats");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    currentWeek: data?.currentWeek,
    lastWeek: data?.lastWeek,
    isLoading,
    error,
  };
}