"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { WorkoutSession, UpdateSetData, FinishSessionData } from "../../types";
import { SessionHeader } from "../SessionHeader/index";
import { ExerciseCard } from "../ExerciseCard/index";
import { FinishWorkoutDialog } from "../FinishWorkoutDialog/index";
import { RestTimer, CancelRestModal } from "../RestTimer/index";

interface WorkoutSessionContentProps {
  session: WorkoutSession;
  onUpdateSet: (data: UpdateSetData) => Promise<void>;
  onFinishSession: (data: FinishSessionData) => Promise<void>;
  isUpdatingSet: boolean;
  isFinishing: boolean;
}

export function WorkoutSessionContent({
  session,
  onUpdateSet,
  onFinishSession,
  isUpdatingSet,
  isFinishing,
}: WorkoutSessionContentProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(session.currentDuration || 0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimeSeconds, setRestTimeSeconds] = useState(0);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Update session duration every minute
  useEffect(() => {
    if (!session.isActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const startTime = new Date(session.startedAt);
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60);
      setSessionDuration(duration);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [session.isActive, session.startedAt]);

  // Auto-advance to next exercise when all sets are completed
  useEffect(() => {
    const currentExercise = session.exercises[currentExerciseIndex];
    if (!currentExercise) return;

    const allSetsCompleted = currentExercise.sets.every(set => set.isCompleted);
    if (allSetsCompleted && currentExerciseIndex < session.exercises.length - 1) {
      // Auto-advance after a short delay
      const timer = setTimeout(() => {
        setCurrentExerciseIndex(prev => prev + 1);
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
    
    // Only start rest timer for new sets, not edits
    if (data.isNewSet) {
      const currentExercise = session.exercises.find(ex => ex.id === data.sessionExerciseId);
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

  const currentExercise = session.exercises[currentExerciseIndex];
  const completedExercises = session.exercises.filter(exercise => 
    exercise.sets.every(set => set.isCompleted)
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

      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{completedExercises}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{session.exercises.length - completedExercises}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {session.exercises.reduce((total, ex) => total + ex.sets.filter(s => s.isCompleted).length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Sets Done</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{sessionDuration}m</div>
                <div className="text-sm text-muted-foreground">Duration</div>
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
          />
        </div>

        {/* Exercise Progress Tracker */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Exercise Progress</h2>
          <div className="grid gap-3">
            {session.exercises.map((exercise, index) => {
              const isCurrentExercise = index === currentExerciseIndex;
              const isCompleted = exercise.sets.every(set => set.isCompleted);
              // const isPast = index < currentExerciseIndex;
              const isFuture = index > currentExerciseIndex;

              return (
                <div
                  key={exercise.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCurrentExercise
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : isCompleted
                      ? "border-green-500 bg-green-50"
                      : isFuture
                      ? "border-gray-200 bg-gray-50 opacity-60"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {isCurrentExercise && !isCompleted && (
                        <Badge variant="default">Now</Badge>
                      )}
                      <div>
                        <h3 className="font-medium">{exercise.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets.length} sets • {exercise.muscleGroup}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {exercise.sets.filter(s => s.isCompleted).length} / {exercise.sets.length}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
        <div className="flex justify-between mt-6">
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