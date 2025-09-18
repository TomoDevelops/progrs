"use client";

import { useQuery } from "@tanstack/react-query";

interface ActiveSession {
  id: string;
  name: string;
  startedAt: string;
}

interface UseActiveSessionReturn {
  activeSession: ActiveSession | null;
  isLoading: boolean;
  error: string | null;
  hasActiveSession: boolean;
}

const fetchActiveSession = async (): Promise<ActiveSession | null> => {
  const response = await fetch("/api/workout-session/active");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch active session");
  }

  return data.data;
};

export const useActiveSession = (): UseActiveSessionReturn => {
  const {
    data: activeSession,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["active-session"],
    queryFn: fetchActiveSession,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 1,
  });

  return {
    activeSession: activeSession || null,
    isLoading,
    error: error?.message || null,
    hasActiveSession: !!activeSession,
  };
};
