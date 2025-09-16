"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import type { WorkoutSessionExercise, UpdateSetData } from "../../types";

interface ExerciseCardProps {
  exercise: WorkoutSessionExercise;
  onUpdateSet: (data: UpdateSetData) => Promise<void>;
  isUpdatingSet: boolean;
}

export function ExerciseCard({
  exercise,
  onUpdateSet,
  isUpdatingSet,
}: ExerciseCardProps) {
  const [recordingSet, setRecordingSet] = useState<string | null>(null);
  const [tempWeight, setTempWeight] = useState<string>("");
  const [tempReps, setTempReps] = useState<string>("");

  const handleSetRecord = (setId: string) => {
    setRecordingSet(setId);
    setTempWeight(exercise.targetWeight?.toString() || "");
    setTempReps(exercise.maxReps?.toString() || "");
  };

  const handleSetSave = async (setId: string, setNumber: number) => {
    const weight = tempWeight ? parseFloat(tempWeight) : undefined;
    const reps = tempReps ? parseInt(tempReps, 10) : undefined;

    if (weight && reps && weight > 0 && reps > 0) {
      // Check if this is a new set (not previously completed)
      const currentSet = exercise.sets.find((s) => s.setNumber === setNumber);
      const isNewSet = !currentSet?.isCompleted;

      await onUpdateSet({
        sessionExerciseId: exercise.id,
        setNumber,
        weight,
        reps,
        isNewSet,
      });
      setRecordingSet(null);
      setTempWeight("");
      setTempReps("");
    }
  };

  const handleSetCancel = () => {
    setRecordingSet(null);
    setTempWeight("");
    setTempReps("");
  };

  const handleSetToggle = async (
    setNumber: number,
    weight: number | null,
    reps: number,
  ) => {
    if (weight && reps) {
      // Check if this is a new set (not previously completed)
      const currentSet = exercise.sets.find((s) => s.setNumber === setNumber);
      const isNewSet = !currentSet?.isCompleted;

      await onUpdateSet({
        sessionExerciseId: exercise.id,
        setNumber,
        weight,
        reps,
        isNewSet,
      });
    }
  };

  const completedSets = exercise.sets.filter((set) => set.isCompleted).length;
  const totalSets = exercise.sets.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{exercise.name}</CardTitle>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">{exercise.muscleGroup}</Badge>
              <Badge variant="outline">
                {completedSets} / {totalSets} sets
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exercise.sets.map((set, index) => {
            const isRecording = recordingSet === set.id;
            const isCurrentlyUpdating = isUpdatingSet && recordingSet === set.id;

            return (
              <div
                key={set.id}
                className={`rounded-lg border p-4 transition-all ${
                  set.isCompleted
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleSetToggle(set.setNumber, set.weight, set.reps)
                      }
                      disabled={isUpdatingSet || !set.weight || !set.reps}
                      className="h-8 w-8 p-1"
                    >
                      {set.isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                    <span className="text-sm font-medium">Set {index + 1}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isRecording ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            placeholder={
                              exercise.targetWeight
                                ? exercise.targetWeight.toString()
                                : "Weight"
                            }
                            value={tempWeight}
                            onChange={(e) => setTempWeight(e.target.value)}
                            className="h-8 w-20 text-sm"
                            min="0"
                            step="0.5"
                          />
                          <span className="text-muted-foreground text-xs">
                            kg
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            placeholder={
                              exercise.maxReps
                                ? exercise.maxReps.toString()
                                : "Reps"
                            }
                            value={tempReps}
                            onChange={(e) => setTempReps(e.target.value)}
                            className="h-8 w-16 text-sm"
                            min="1"
                          />
                          <span className="text-muted-foreground text-xs">
                            reps
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleSetSave(set.id, set.setNumber)}
                            disabled={
                              isCurrentlyUpdating || !tempWeight || !tempReps
                            }
                            className="h-8 px-2"
                          >
                            {isCurrentlyUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Save"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSetCancel}
                            disabled={isCurrentlyUpdating}
                            className="h-8 px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        {set.weight && set.reps ? (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">{set.weight} kg</span>
                            <span className="text-muted-foreground">×</span>
                            <span className="font-medium">{set.reps} reps</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Click Record to add weight and reps
                          </span>
                        )}
                        {!set.weight || !set.reps ? (
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleSetRecord(set.id)}
                             disabled={isUpdatingSet}
                             className="h-8 px-3"
                           >
                             Record
                           </Button>
                         ) : null}
                       </div>
                     )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Exercise Summary */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-gray-900">{completedSets}</div>
              <div className="text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {exercise.sets
                  .filter((s) => s.weight && s.reps)
                  .reduce((total, s) => total + s.weight! * s.reps!, 0)
                  .toLocaleString()}
              </div>
              <div className="text-muted-foreground">Total Volume</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {Math.max(
                  ...exercise.sets
                    .filter((s) => s.weight)
                    .map((s) => s.weight!),
                  0,
                ) || 0}
              </div>
              <div className="text-muted-foreground">Max Weight</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
