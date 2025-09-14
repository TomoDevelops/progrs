"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseSelector } from "./ExerciseSelector";
import { type WorkoutRoutine } from "@/features/workout-routines/types";

interface ExerciseListProps {
  form: UseFormReturn<WorkoutRoutine>;
  selectedExercises: Record<
    string,
    {
      id: string;
      name: string;
      muscleGroup: string;
      equipment?: string;
    }
  >;
  setSelectedExercises: React.Dispatch<
    React.SetStateAction<
      Record<
        string,
        {
          id: string;
          name: string;
          muscleGroup: string;
          equipment?: string;
        }
      >
    >
  >;
}

export function ExerciseList({
  form,
  selectedExercises,
  setSelectedExercises,
}: ExerciseListProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const handleExerciseSelect = (exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    equipment?: string;
  }) => {
    setSelectedExercises((prev) => ({
      ...prev,
      [exercise.id]: exercise,
    }));
    append({
      exerciseId: exercise.id,
      sets: 3,
      minReps: 8,
      maxReps: 12,
      targetWeight: undefined,
      restTime: 60,
      notes: "",
    });
  };

  const handleExerciseRemove = (index: number, exerciseId: string) => {
    remove(index);
    setSelectedExercises((prev) => {
      const newState = { ...prev };
      delete newState[exerciseId];
      return newState;
    });
  };

  return (
    <div className="space-y-4">
      <ExerciseSelector
        onExerciseSelect={handleExerciseSelect}
        selectedExerciseIds={fields.map((f) => f.exerciseId)}
      />
      {fields.map((field, index) => (
        <ExerciseCard
          key={field.id}
          field={field}
          index={index}
          selectedExercises={selectedExercises}
          form={form}
          onRemove={handleExerciseRemove}
        />
      ))}
    </div>
  );
}
