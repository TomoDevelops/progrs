"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { WorkoutHistoryItem } from "@/app/api/dashboard/repository/dashboard.repository";
import { useWorkoutDetail } from "@/features/dashboard/hooks/useWorkoutDetail";

interface WorkoutDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWorkout: WorkoutHistoryItem | null;
}

export const WorkoutDetailModal = ({
  isOpen,
  onOpenChange,
  selectedWorkout,
}: WorkoutDetailModalProps) => {
  const { workoutDetail, isLoadingDetail, error } = useWorkoutDetail({
    workoutId: selectedWorkout?.id || null,
    isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedWorkout?.routineName || "Workout Details"}
          </DialogTitle>
        </DialogHeader>
        {selectedWorkout && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {selectedWorkout.totalExercises}
                </p>
                <p className="text-sm text-gray-600">Exercises</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {selectedWorkout.totalSets}
                </p>
                <p className="text-sm text-gray-600">Sets</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Date:</span>
                <span className="text-sm text-gray-600">
                  {selectedWorkout.endedAt
                    ? new Date(selectedWorkout.endedAt).toLocaleDateString()
                    : "In progress"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Duration:</span>
                <span className="text-sm text-gray-600">
                  {selectedWorkout.totalDuration
                    ? `${selectedWorkout.totalDuration} min`
                    : "Not recorded"}
                </span>
              </div>
              {selectedWorkout.notes && (
                <div>
                  <span className="text-sm font-medium">Notes:</span>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedWorkout.notes}
                  </p>
                </div>
              )}
            </div>

            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-600">
                  Loading workout details...
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-red-600">Error: {error}</div>
              </div>
            ) : workoutDetail ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Exercises</h3>
                {workoutDetail.exercises.map((exercise) => (
                  <div key={exercise.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-medium">{exercise.name}</h4>
                      <div className="text-sm text-gray-600">
                        {exercise.muscleGroup} • {exercise.equipment}
                      </div>
                    </div>
                    {exercise.sets.length > 0 ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600">
                          <div>Set</div>
                          <div>Reps</div>
                          <div>Weight (kg)</div>
                          <div>Volume (kg)</div>
                        </div>
                        {exercise.sets.map((set, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-4 gap-2 text-sm"
                          >
                            <div>{index + 1}</div>
                            <div>{set.reps}</div>
                            <div>{set.weight ?? 0}</div>
                            <div>
                              {(set.reps * (set.weight ?? 0)).toFixed(1)}
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-2 text-sm font-medium">
                          Total:{" "}
                          {exercise.sets
                            .reduce(
                              (total, set) =>
                                total + set.reps * (set.weight ?? 0),
                              0,
                            )
                            .toFixed(1)}{" "}
                          kg
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        No sets recorded
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                No detailed workout data available
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
