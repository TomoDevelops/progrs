import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { WorkoutSessionDetail } from "@/app/api/dashboard/repository/dashboard.repository";

interface UseWorkoutDetailProps {
  workoutId: string | null;
  isOpen: boolean;
}

interface UseWorkoutDetailReturn {
  workoutDetail: WorkoutSessionDetail | null;
  isLoadingDetail: boolean;
  error: string | null;
}

export const useWorkoutDetail = ({
  workoutId,
  isOpen,
}: UseWorkoutDetailProps): UseWorkoutDetailReturn => {
  const {
    data: workoutDetail,
    isLoading: isLoadingDetail,
    error,
  } = useApiQuery<WorkoutSessionDetail>(
    ["workout-detail", workoutId || ""],
    `/dashboard/workout-session/${workoutId}`,
    {
      enabled: isOpen && !!workoutId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 1,
      showErrorToast: false, // Handle errors in UI
    },
  );

  return {
    workoutDetail: workoutDetail || null,
    isLoadingDetail,
    error: error?.message || null,
  };
};
