import { useQuery } from '@tanstack/react-query';
import { WorkoutSessionDetail } from '@/app/api/dashboard/repository/dashboard.repository';

interface UseWorkoutDetailProps {
  workoutId: string | null;
  isOpen: boolean;
}

interface UseWorkoutDetailReturn {
  workoutDetail: WorkoutSessionDetail | null;
  isLoadingDetail: boolean;
  error: string | null;
}

const fetchWorkoutDetail = async (id: string): Promise<WorkoutSessionDetail> => {
  const response = await fetch(`/api/dashboard/workout-session/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch workout details');
  }
  
  return data.data;
};

export const useWorkoutDetail = ({ workoutId, isOpen }: UseWorkoutDetailProps): UseWorkoutDetailReturn => {
  const { data: workoutDetail, isLoading: isLoadingDetail, error } = useQuery({
    queryKey: ['workout-detail', workoutId],
    queryFn: () => fetchWorkoutDetail(workoutId!),
    enabled: isOpen && !!workoutId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  return {
    workoutDetail: workoutDetail || null,
    isLoadingDetail,
    error: error?.message || null,
  };
};