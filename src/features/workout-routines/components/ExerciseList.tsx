"use client";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseSelector } from "./ExerciseSelector";
import { type WorkoutRoutine } from "@/features/workout-routines/types";
import { DraggableExerciseList, type DraggableExercise } from "@/shared/components/DraggableExerciseList";

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
  const { fields, append } = useFieldArray({
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



  const handleExerciseReorder = (reorderedExercises: DraggableExercise[]) => {
    // Update the form field array to match the new order
    const currentExercises = form.getValues("exercises");
    const newOrderedExercises = reorderedExercises.map((dragExercise) => {
      const originalIndex = parseInt(dragExercise.id.split("-")[1]);
      return currentExercises[originalIndex];
    });
    
    // Replace all exercises with the new order
    form.setValue("exercises", newOrderedExercises);
  };

  // Convert form fields to draggable exercises format
  const draggableExercises: DraggableExercise[] = fields.map((field, index) => {
    const exercise = selectedExercises[field.exerciseId];
    const formExercise = form.getValues(`exercises.${index}`);
    
    return {
      id: `exercise-${index}`,
      name: exercise?.name || `Exercise ${index + 1}`,
      muscleGroup: exercise?.muscleGroup,
      sets: formExercise?.sets,
      reps: formExercise?.minReps && formExercise?.maxReps 
        ? `${formExercise.minReps}-${formExercise.maxReps}`
        : formExercise?.minReps?.toString() || formExercise?.maxReps?.toString(),
      weight: formExercise?.targetWeight?.toString(),
      restTime: formExercise?.restTime,
      notes: formExercise?.notes,
      originalIndex: index,
      exerciseId: field.exerciseId,
      fieldId: field.id,
    };
  });

  return (
    <div className="space-y-4">
      <ExerciseSelector
        onExerciseSelect={handleExerciseSelect}
        selectedExerciseIds={fields.map((f) => f.exerciseId)}
      />
      
      {fields.length > 0 && (
        <DraggableExerciseList
          exercises={draggableExercises}
          onReorder={handleExerciseReorder}
          renderExercise={(exercise) => {
            const originalIndex = exercise.originalIndex as number;
            const field = fields[originalIndex];
            if (!field) return null;
            
            return (
              <ExerciseCard
                field={field}
                index={originalIndex}
                selectedExercises={selectedExercises}
                form={form}
                onRemove={() => {}} // Remove handled by DraggableExerciseList
              />
            );
          }}
          showDragHandle={true}
          className="space-y-3"
        />
      )}
    </div>
  );
}
