"use client";

import { UseFormReturn } from "react-hook-form";

import { Card } from "@/shared/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
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
import { RecentSetsFooter } from "./RecentSetsFooter";

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
  onRemove?: (index: number, exerciseId: string) => void;
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
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`exercise-${field.id}`} className="border-none">
          <AccordionTrigger className="items-center px-6 py-4 hover:no-underline">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-left text-base font-medium">
                    {selectedExercises[field.exerciseId]?.name ||
                      `Exercise ${index + 1}`}
                  </div>
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
              </div>
              {onRemove && (
                <Trash2
                  className="h-4 w-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index, field.exerciseId);
                  }}
                />
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              {/* Hidden as exercise ID doens't have to be exposed */}
              <div className="hidden">
                <FormField
                  control={form.control}
                  name={`exercises.${index}.exerciseId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter exercise name or ID"
                          {...field}
                        />
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                      <FormLabel>Target Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
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
            </div>

            {/* Recent Sets Footer */}
            <RecentSetsFooter exerciseId={field.exerciseId} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
