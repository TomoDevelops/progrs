"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  WorkoutSession,
  UpdateSetData,
  FinishSessionData,
  ApiResponse,
  UpdateSetRequest,
  FinishSessionRequest,
} from "../types";

export function useWorkoutSession(sessionId: string) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingSet, setIsUpdatingSet] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isFinishingWorkout, setIsFinishingWorkout] = useState(false);
  const router = useRouter();

  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/workout-session/${sessionId}`);
      const result: ApiResponse<WorkoutSession> = await response.json();

      if (result.success && result.data) {
        // Convert date strings to Date objects
        const sessionData = {
          ...result.data,
          startedAt: new Date(result.data.startedAt),
          endedAt: result.data.endedAt ? new Date(result.data.endedAt) : null,
        };
        setSession(sessionData);
      } else {
        setError(result.error || "Failed to fetch workout session");
      }
    } catch (err) {
      console.error("Error fetching workout session:", err);
      setError("Failed to fetch workout session");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Update a set
  const updateSet = useCallback(
    async (data: UpdateSetData) => {
      if (!session) return;

      try {
        setIsUpdatingSet(true);

        const requestData: UpdateSetRequest = {
          action: "updateSet",
          ...data,
        };

        const response = await fetch("/api/workout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const result: ApiResponse = await response.json();

        if (result.success) {
          // Update the local state optimistically
          setSession((prevSession) => {
            if (!prevSession) return prevSession;

            const updatedExercises = prevSession.exercises.map((exercise) => {
              if (exercise.id === data.sessionExerciseId) {
                const updatedSets = exercise.sets.map((set) => {
                  if (set.setNumber === data.setNumber) {
                    return {
                      ...set,
                      weight: data.weight,
                      reps: data.reps,
                      isCompleted: true,
                    };
                  }
                  return set;
                });
                return { ...exercise, sets: updatedSets };
              }
              return exercise;
            });

            return { ...prevSession, exercises: updatedExercises };
          });

          toast.success("Set recorded successfully!");
        } else {
          toast.error(result.error || "Failed to update set");
        }
      } catch (err) {
        console.error("Error updating set:", err);
        toast.error("Failed to update set");
      } finally {
        setIsUpdatingSet(false);
      }
    },
    [session],
  );

  // Finish session
  const finishSession = useCallback(
    async (data: FinishSessionData) => {
      if (!session) return;

      try {
        setIsFinishing(true);
        setIsFinishingWorkout(true); // Disable navigation alert

        const requestData: FinishSessionRequest = {
          action: "finish",
          ...data,
        };

        const response = await fetch(`/api/workout-session/${sessionId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const result: ApiResponse<{ endedAt: string; totalDuration: number }> =
          await response.json();

        if (result.success && result.data) {
          toast.success("Workout completed!", {
            description: `Total duration: ${result.data.totalDuration} minutes`,
          });

          // Redirect to dashboard or workout summary
          router.push("/");
        } else {
          toast.error(result.error || "Failed to finish workout");
          setIsFinishingWorkout(false); // Re-enable if there's an error
        }
      } catch (err) {
        console.error("Error finishing workout:", err);
        toast.error("Failed to finish workout");
        setIsFinishingWorkout(false); // Re-enable if there's an error
      } finally {
        setIsFinishing(false);
      }
    },
    [session, sessionId, router],
  );

  // Navigation guard
  useEffect(() => {
    if (!session?.isActive || isFinishingWorkout) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "You have an active workout session. Leaving will keep your progress but you'll need to return to finish it. Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session?.isActive, isFinishingWorkout]);

  // Initial fetch
  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, fetchSession]);

  return {
    session,
    isLoading,
    error,
    updateSet,
    finishSession,
    isUpdatingSet,
    isFinishing,
    refetch: fetchSession,
  };
}
