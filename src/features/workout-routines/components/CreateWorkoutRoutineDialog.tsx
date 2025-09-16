"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useLocale } from "@/shared/providers/LocaleProvider";
import { formatDateWithLocale } from "@/shared/utils/date";

import {
  workoutRoutineSchema,
  type WorkoutRoutine,
} from "@/features/workout-routines/types";

import { ExerciseList } from "@/features/workout-routines/components/ExerciseList";

interface CreateWorkoutRoutineDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateWorkoutRoutineDialog({
  trigger,
  onSuccess,
}: CreateWorkoutRoutineDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<
    Record<
      string,
      {
        id: string;
        name: string;
        muscleGroup: string;
        equipment?: string;
      }
    >
  >({});
  const { dateFnsLocale } = useLocale();

  const form = useForm<WorkoutRoutine>({
    resolver: zodResolver(workoutRoutineSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 60,
      exercises: [],
      schedule: {
        recurrencePattern: "one-time",
        daysOfWeek: [],
      },
    },
  });

  const onSubmit = async (data: WorkoutRoutine) => {
    setIsSubmitting(true);
    try {
      // Transform the data to ensure proper date handling
      const transformedData = {
        ...data,
        schedule: data.schedule
          ? {
              ...data.schedule,
              startDate: data.schedule.startDate,
              endDate: data.schedule.endDate,
            }
          : undefined,
      };

      const response = await fetch("/api/routines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData, (key, value) => {
          // Convert Date objects to ISO strings for consistent handling
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Workout routine created!", {
          description: "Your new routine has been saved successfully.",
        });
        setOpen(false);
        form.reset();
        onSuccess?.();
      } else {
        console.error("Failed to create routine:", result.error);
        toast.error("Failed to create routine", {
          description: result.error || "An unexpected error occurred",
        });
      }
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.error("Error creating routine", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Routine
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workout Routine</DialogTitle>
          <DialogDescription>
            Create a new workout routine with exercises and scheduling.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Routine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Push Day" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="480"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your workout routine..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Exercises Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Exercises</h3>
              </div>

              <ExerciseList
                form={form}
                selectedExercises={selectedExercises}
                setSelectedExercises={setSelectedExercises}
              />
            </div>

            {/* Scheduling Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Scheduling (Optional)</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="schedule.startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                formatDateWithLocale(
                                  field.value,
                                  "PPP",
                                  dateFnsLocale || undefined,
                                )
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            autoFocus
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                // Create a new date at midnight UTC to avoid timezone issues
                                const utcDate = new Date(
                                  Date.UTC(
                                    date.getFullYear(),
                                    date.getMonth(),
                                    date.getDate(),
                                  ),
                                );
                                field.onChange(utcDate);
                              } else {
                                field.onChange(date);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            locale={dateFnsLocale || undefined}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schedule.recurrencePattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence Pattern</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select recurrence pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="one-time">One Time</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Routine
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
