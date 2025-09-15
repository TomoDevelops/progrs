"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Trash2 } from "lucide-react";
import { type WorkoutRoutine } from "@/features/workout-routines/types";
import { RestTimeInput } from "./RestTimeInput";

interface ExerciseCardProps {
  field: {
    id: string;
    exerciseId: string;
  };
  index: number;
  selectedExercises: Record<
    string,
    {
      id: string;
      name: string;
      muscleGroup: string;
      equipment?: string;
    }
  >;
  form: UseFormReturn<WorkoutRoutine>;
  onRemove: (index: number, exerciseId: string) => void;
}

export function ExerciseCard({
  field,
  index,
  selectedExercises,
  form,
  onRemove,
}: ExerciseCardProps) {
  return (
    <Card key={field.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">
              {selectedExercises[field.exerciseId]?.name ||
                `Exercise ${index + 1}`}
            </CardTitle>
            {selectedExercises[field.exerciseId] && (
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {selectedExercises[field.exerciseId].muscleGroup}
                </Badge>
                {selectedExercises[field.exerciseId].equipment && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedExercises[field.exerciseId].equipment}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index, field.exerciseId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden as exercise ID doens't have to be exposed */}
        <div className="hidden">
          <FormField
            control={form.control}
            name={`exercises.${index}.exerciseId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exercise</FormLabel>
                <FormControl>
                  <Input placeholder="Enter exercise name or ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name={`exercises.${index}.sets`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sets</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`exercises.${index}.minReps`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Reps</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`exercises.${index}.maxReps`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Reps</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name={`exercises.${index}.restTime`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rest Time</FormLabel>
                <FormControl>
                  <RestTimeInput
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name={`exercises.${index}.targetWeight`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Weight (lbs/kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`exercises.${index}.notes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Exercise notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
