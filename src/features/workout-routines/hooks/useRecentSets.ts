import { useQuery } from "@tanstack/react-query";

type RecentSet = {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number;
  sessionDate: string;
  sessionName: string;
};

type RecentSetsResponse = {
  success: boolean;
  data: RecentSet[];
  error?: string;
};

export function useRecentSets(exerciseId: string | null) {
  return useQuery({
    queryKey: ["recent-sets", exerciseId],
    queryFn: async (): Promise<RecentSet[]> => {
      if (!exerciseId) {
        return [];
      }

      const response = await fetch(`/api/exercises/${exerciseId}/recent-sets`);

      if (!response.ok) {
        throw new Error("Failed to fetch recent sets");
      }

      const result: RecentSetsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch recent sets");
      }

      return result.data;
    },
    enabled: !!exerciseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
