import { useState, useEffect } from 'react';
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

export const useWorkoutDetail = ({ workoutId, isOpen }: UseWorkoutDetailProps): UseWorkoutDetailReturn => {
  const [workoutDetail, setWorkoutDetail] = useState<WorkoutSessionDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setWorkoutDetail(null);
    setError(null);

    try {
      const response = await fetch(`/api/dashboard/workout-session/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWorkoutDetail(data.data);
        } else {
          setError(data.error || 'Failed to fetch workout details');
        }
      } else {
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Failed to fetch workout details:', err);
      setError('Network error occurred');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (isOpen && workoutId) {
      fetchWorkoutDetail(workoutId);
    } else {
      // Reset state when modal closes or no workout selected
      setWorkoutDetail(null);
      setError(null);
    }
  }, [isOpen, workoutId]);

  return {
    workoutDetail,
    isLoadingDetail,
    error,
  };
};