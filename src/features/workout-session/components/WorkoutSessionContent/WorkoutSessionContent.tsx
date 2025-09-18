"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type {
  WorkoutSession,
  UpdateSetData,
  FinishSessionData,
} from "../../types";
import { SessionHeader } from "../SessionHeader/index";
import { ExerciseCard } from "../ExerciseCard/index";
import { FinishWorkoutDialog } from "../FinishWorkoutDialog/index";
import { RestTimer, CancelRestModal } from "../RestTimer/index";
import {
  DraggableExerciseList,
  type DraggableExercise,
} from "@/shared/components/DraggableExerciseList";

interface WorkoutSessionContentProps {
  session: WorkoutSession;
  onUpdateSet: (data: UpdateSetData) => Promise<void>;
  onFinishSession: (data: FinishSessionData) => Promise<void>;
  onReorderExercises?: (
    reorderedExercises: WorkoutSession["exercises"],
  ) => Promise<void>;
  isUpdatingSet: boolean;
  isFinishing: boolean;
}

export function WorkoutSessionContent({
  session,
  onUpdateSet,
  onFinishSession,
  onReorderExercises,
  isUpdatingSet,
  isFinishing,
}: WorkoutSessionContentProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimeSeconds, setRestTimeSeconds] = useState(0);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Calculate session duration as derived state
  const sessionDuration = useMemo(() => {
    if (!session.isActive || !session.startedAt) {
      return session.currentDuration || 0;
    }
    const now = new Date();
    const startTime = new Date(session.startedAt);
    return Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60);
  }, [session.isActive, session.startedAt, session.currentDuration]);

  // Auto-advance to next exercise when all sets are completed
  useEffect(() => {
    const currentExercise = session.exercises[currentExerciseIndex];
    if (!currentExercise) return;

    const allSetsCompleted = currentExercise.sets.every(
      (set) => set.isCompleted,
    );
    if (
      allSetsCompleted &&
      currentExerciseIndex < session.exercises.length - 1
    ) {
      // Auto-advance after a short delay
      const timer = setTimeout(() => {
        setCurrentExerciseIndex((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [session.exercises, currentExerciseIndex]);

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handleFinishWorkout = () => {
    setIsFinishDialogOpen(true);
  };

  const handleSetUpdate = async (data: UpdateSetData) => {
    await onUpdateSet(data);

    // Trigger timer reset when new record is input (even if timer is running)
    setResetTrigger((prev) => prev + 1);

    // Only start rest timer for new sets, not edits
    if (data.isNewSet) {
      const currentExercise = session.exercises.find(
        (ex) => ex.id === data.sessionExerciseId,
      );
      if (currentExercise?.restTime && currentExercise.restTime > 0) {
        setRestTimeSeconds(currentExercise.restTime);
        setIsRestTimerActive(true);
      }
    }
  };

  const handleRestTimerComplete = () => {
    setIsRestTimerActive(false);
    setRestTimeSeconds(0);
  };

  const handleRestTimerCancel = () => {
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancelRest = () => {
    setIsRestTimerActive(false);
    setRestTimeSeconds(0);
    setIsCancelModalOpen(false);
  };

  const handleExerciseReorder = async (
    reorderedExercises: DraggableExercise[],
  ) => {
    if (!onReorderExercises) return;

    // Convert draggable exercises back to session exercises with updated order
    const newOrderedExercises = reorderedExercises.map(
      (dragExercise, newIndex) => {
        const originalIndex = parseInt(dragExercise.id.split("-")[1]);
        const originalExercise = session.exercises[originalIndex];
        return {
          ...originalExercise,
          orderIndex: newIndex,
        };
      },
    );

    // Update current exercise index if needed
    const currentExercise = session.exercises[currentExerciseIndex];
    if (currentExercise) {
      const newCurrentIndex = newOrderedExercises.findIndex(
        (ex) => ex.id === currentExercise.id,
      );
      if (newCurrentIndex !== -1) {
        setCurrentExerciseIndex(newCurrentIndex);
      }
    }

    await onReorderExercises(newOrderedExercises);
  };

  // Convert session exercises to draggable format
  const draggableExercises: DraggableExercise[] = session.exercises.map(
    (exercise, index) => {
      const completedSets = exercise.sets.filter(
        (set) => set.isCompleted,
      ).length;
      const totalSets = exercise.sets.length;
      const isCompleted = exercise.sets.every((set) => set.isCompleted);

      return {
        id: `exercise-${index}`,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup || undefined,
        sets: totalSets,
        reps:
          exercise.minReps && exercise.maxReps
            ? `${exercise.minReps}-${exercise.maxReps}`
            : exercise.minReps?.toString() || exercise.maxReps?.toString(),
        weight: exercise.targetWeight?.toString(),
        restTime: exercise.restTime || undefined,
        notes: `${completedSets} / ${totalSets} sets`,
        originalIndex: index,
        exerciseId: exercise.id,
        isCompleted,
      };
    },
  );

  const currentExercise = session.exercises[currentExerciseIndex];
  const completedExercises = session.exercises.filter((exercise) =>
    exercise.sets.every((set) => set.isCompleted),
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session Header */}
      <SessionHeader
        workoutName={session.name}
        routineName={session.routineName || undefined}
        duration={sessionDuration}
        estimatedDuration={session.estimatedDuration || undefined}
        onFinish={handleFinishWorkout}
        isFinishing={isFinishing}
      />

      <div className="container mx-auto max-w-4xl px-4 py-6">
        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Workout Progress</span>
              <Badge variant="secondary">
                {completedExercises} / {session.exercises.length} exercises
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {completedExercises}
                </div>
                <div className="text-muted-foreground text-sm">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {session.exercises.length - completedExercises}
                </div>
                <div className="text-muted-foreground text-sm">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {session.exercises.reduce(
                    (total, ex) =>
                      total + ex.sets.filter((s) => s.isCompleted).length,
                    0,
                  )}
                </div>
                <div className="text-muted-foreground text-sm">Sets Done</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {sessionDuration}m
                </div>
                <div className="text-muted-foreground text-sm">Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rest Timer */}
        <div className="mb-6">
          <RestTimer
            restTimeSeconds={restTimeSeconds}
            onComplete={handleRestTimerComplete}
            onCancel={handleRestTimerCancel}
            isActive={isRestTimerActive}
            className="w-full"
            resetTrigger={resetTrigger}
          />
        </div>

        {/* Exercise Progress Tracker with Drag & Drop */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">Exercise Progress</h2>
          <DraggableExerciseList
            exercises={draggableExercises}
            onReorder={handleExerciseReorder}
            renderExercise={(exercise) => {
              const originalIndex = exercise.originalIndex as number;
              const sessionExercise = session.exercises[originalIndex];
              const isCurrentExercise = originalIndex === currentExerciseIndex;
              const isCompleted = exercise.isCompleted;
              const isFuture = originalIndex > currentExerciseIndex;

              return (
                <div
                  className={`rounded-lg border p-4 transition-all ${
                    isCurrentExercise
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : isCompleted
                        ? "border-green-500 bg-green-50"
                        : isFuture
                          ? "border-gray-200 bg-gray-50 opacity-60"
                          : "border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {isCurrentExercise && !isCompleted && (
                        <Badge variant="default">Now</Badge>
                      )}
                      <div>
                        <h3 className="font-medium">{exercise.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {sessionExercise.sets.length} sets •{" "}
                          {exercise.muscleGroup}
                        </p>
                      </div>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {exercise.notes}
                    </div>
                  </div>
                </div>
              );
            }}
            showDragHandle={true}
            className="space-y-3"
          />
        </div>

        {/* Current Exercise Detail */}
        {currentExercise && (
          <ExerciseCard
            exercise={currentExercise}
            onUpdateSet={handleSetUpdate}
            isUpdatingSet={isUpdatingSet}
          />
        )}

        {/* Navigation Controls */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
          >
            Previous Exercise
          </Button>
          <Button
            variant="outline"
            onClick={handleNextExercise}
            disabled={currentExerciseIndex === session.exercises.length - 1}
          >
            Next Exercise
          </Button>
        </div>
      </div>

      {/* Finish Workout Dialog */}
      <FinishWorkoutDialog
        open={isFinishDialogOpen}
        onOpenChange={setIsFinishDialogOpen}
        onConfirm={onFinishSession}
        isFinishing={isFinishing}
        completedExercises={completedExercises}
        totalExercises={session.exercises.length}
        duration={sessionDuration}
      />

      {/* Cancel Rest Modal */}
      <CancelRestModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        onConfirm={handleConfirmCancelRest}
      />
    </div>
  );
}
