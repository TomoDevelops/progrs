"use client";

import { useParams } from "next/navigation";
import { WorkoutSessionContent } from "@/features/workout-session/components/WorkoutSessionContent";
import { useWorkoutSession } from "@/features/workout-session/hooks/useWorkoutSession";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";

export default function WorkoutSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const {
    session,
    isLoading,
    error,
    updateSet,
    finishSession,
    reorderExercises,
    isUpdatingSet,
    isFinishing,
  } = useWorkoutSession(sessionId);

  if (isLoading) {
    return (
      <LoadingState 
        message="Loading workout session..." 
        fullScreen 
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Error Loading Session"
        message={error}
        fullScreen
        variant="destructive"
      />
    );
  }

  if (!session) {
    return (
      <ErrorState 
        title="Session Not Found"
        message="The workout session could not be found."
        fullScreen
      />
    );
  }

  return (
    <WorkoutSessionContent
      session={session}
      onUpdateSet={updateSet}
      onFinishSession={finishSession}
      onReorderExercises={reorderExercises}
      isUpdatingSet={isUpdatingSet}
      isFinishing={isFinishing}
    />
  );
}
