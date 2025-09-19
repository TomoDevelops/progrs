"use client";

import { useQuery } from "@tanstack/react-query";
import type { UserSettings } from "@/features/settings/types";

export const useUserSettings = (enabled: boolean = true) => {
  return useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const response = await fetch("/api/me/settings");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || "Failed to fetch settings");
      }
      const result = await response.json();
      return result.data;
    },
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('Unauthorized')) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};