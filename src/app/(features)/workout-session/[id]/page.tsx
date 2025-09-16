"use client";

import { useParams } from "next/navigation";
import { WorkoutSessionContent } from "@/features/workout-session/components/WorkoutSessionContent";
import { useWorkoutSession } from "@/features/workout-session/hooks/useWorkoutSession";
import { Loader2 } from "lucide-react";

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading workout session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Session Not Found</h1>
          <p className="text-muted-foreground">
            The workout session could not be found.
          </p>
        </div>
      </div>
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
