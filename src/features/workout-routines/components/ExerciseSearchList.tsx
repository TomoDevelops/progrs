"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";

type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string;
  instructions?: string;
  isPublic: boolean;
};

type ExerciseSearchListProps = {
  isLoading: boolean;
  error: string | null;
  exercises: Exercise[];
  selectedExerciseIds: string[];
  onExerciseSelect: (exercise: Exercise) => void;
};

export function ExerciseSearchList({
  isLoading,
  error,
  exercises,
  selectedExerciseIds,
  onExerciseSelect,
}: ExerciseSearchListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground ml-2 text-sm">
          Loading exercises...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive py-4 text-center text-sm">{error}</div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">
        No exercises found
      </div>
    );
  }

  return (
    <>
      {exercises.map((exercise) => {
        const isSelected = selectedExerciseIds.includes(exercise.id);
        return (
          <Card
            key={exercise.id}
            className={cn(
              "hover:bg-muted/50 cursor-pointer transition-colors",
              isSelected && "bg-muted border-primary",
            )}
            onClick={() => !isSelected && onExerciseSelect(exercise)}
          >
            <CardContent className="px-3">
              <div className="space-y-2">
                <h4 className="text-sm leading-none font-medium">
                  {exercise.name}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {exercise.muscleGroup}
                  </Badge>
                  {exercise.equipment && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {exercise.equipment}
                    </Badge>
                  )}
                </div>
                {isSelected && (
                  <div className="text-primary text-xs font-medium">
                    Already added
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}

export type { Exercise, ExerciseSearchListProps };