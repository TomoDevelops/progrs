"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Slider } from "@/shared/components/ui/slider";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Plus, Loader2, RotateCcw } from "lucide-react";
import { generateWorkoutRequestSchema, type GenerateWorkoutRequest, type EquipmentType, type FitnessLevel, type WorkoutType, type MuscleGroup } from "@/features/ai-workouts/schemas/ai-workout.schemas";

interface WorkoutFormProps {
  onSubmit: (data: GenerateWorkoutRequest) => void;
  onReset: () => void;
  isLoading: boolean;
  initialData?: GenerateWorkoutRequest | null;
}

const MUSCLE_GROUPS = [
  { id: "chest" as const, label: "Chest" },
  { id: "back" as const, label: "Back" },
  { id: "shoulders" as const, label: "Shoulders" },
  { id: "arms" as const, label: "Arms" },
  { id: "legs" as const, label: "Legs" },
  { id: "glutes" as const, label: "Glutes" },
  { id: "core" as const, label: "Core" },
  { id: "full_body" as const, label: "Full Body" },
];

const WORKOUT_TYPES = [
  { id: "strength", label: "Strength", description: "Focus on building muscle and power" },
  { id: "cardio", label: "Cardio", description: "Improve cardiovascular endurance" },
  { id: "hiit", label: "HIIT", description: "High-intensity interval training" },
  { id: "flexibility", label: "Flexibility", description: "Stretching and mobility work" },
  { id: "mixed", label: "Mixed", description: "Combination of different training styles" },
];

const EQUIPMENT_OPTIONS = [
  { id: "bodyweight" as const, label: "Bodyweight" },
  { id: "dumbbells" as const, label: "Dumbbells" },
  { id: "barbell" as const, label: "Barbell" },
  { id: "kettlebells" as const, label: "Kettlebells" },
  { id: "resistance_bands" as const, label: "Resistance Bands" },
  { id: "bench" as const, label: "Bench" },
  { id: "pull_up_bar" as const, label: "Pull-up Bar" },
  { id: "cable_machine" as const, label: "Cable Machine" },
  { id: "squat_rack" as const, label: "Squat Rack" },
  { id: "cardio_machine" as const, label: "Cardio Machine" },
];

const LEVELS = [
  { id: "beginner", label: "Beginner", description: "New to fitness or returning after a break" },
  { id: "intermediate", label: "Intermediate", description: "Regular training for 6+ months" },
  { id: "advanced", label: "Advanced", description: "Experienced with complex movements" },
];

export function WorkoutForm({ onSubmit, onReset, isLoading, initialData }: WorkoutFormProps) {
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>(initialData?.targetMuscleGroups || []);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>(initialData?.availableEquipment || []);
  const [selectedLevel, setSelectedLevel] = useState<FitnessLevel>(initialData?.fitnessLevel || "intermediate");
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType>(initialData?.workoutType || "strength");
  const [duration, setDuration] = useState<number[]>([initialData?.targetDuration || 45]);

  const form = useForm<GenerateWorkoutRequest>({
    resolver: zodResolver(generateWorkoutRequestSchema) as Resolver<GenerateWorkoutRequest>,
    defaultValues: {
      fitnessLevel: (initialData?.fitnessLevel as "beginner" | "intermediate" | "advanced") || "intermediate",
      availableEquipment: initialData?.availableEquipment || ["bodyweight"],
      targetMuscleGroups: initialData?.targetMuscleGroups || [],
      workoutType: (initialData?.workoutType as "strength" | "cardio" | "hiit" | "flexibility" | "mixed") || "strength",
      targetDuration: initialData?.targetDuration || 45,
      allowCachedResults: true,
      regenerate: false,
    },
  });

  const toggleMuscleGroup = (muscleGroup: MuscleGroup) => {
    const updated = selectedMuscleGroups.includes(muscleGroup)
      ? selectedMuscleGroups.filter(mg => mg !== muscleGroup)
      : [...selectedMuscleGroups, muscleGroup];
    setSelectedMuscleGroups(updated);
    form.setValue("targetMuscleGroups", updated);
  };

  const toggleEquipment = (equipment: EquipmentType) => {
    const updated = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter(eq => eq !== equipment)
      : [...selectedEquipment, equipment];
    setSelectedEquipment(updated);
    form.setValue("availableEquipment", updated);
  };

  const handleLevelChange = (level: FitnessLevel) => {
    setSelectedLevel(level);
    form.setValue("fitnessLevel", level);
  };

  const handleWorkoutTypeChange = (workoutType: WorkoutType) => {
    setSelectedWorkoutType(workoutType);
    form.setValue("workoutType", workoutType);
  };

  const handleDurationChange = (value: number[]) => {
    setDuration(value);
    form.setValue("targetDuration", value[0]);
  };

  const handleSubmit = (data: GenerateWorkoutRequest) => {
    onSubmit({
      ...data,
      targetMuscleGroups: selectedMuscleGroups,
      availableEquipment: selectedEquipment,
      fitnessLevel: selectedLevel,
      workoutType: selectedWorkoutType,
      targetDuration: duration[0],
    });
  };

  const handleReset = () => {
    setSelectedMuscleGroups([]);
    setSelectedEquipment(["bodyweight"]);
    setSelectedLevel("intermediate");
    setSelectedWorkoutType("strength");
    setDuration([45]);
    form.reset({
      fitnessLevel: "intermediate",
      availableEquipment: ["bodyweight"],
      targetMuscleGroups: [],
      workoutType: "strength",
      targetDuration: 45,
      allowCachedResults: true,
      regenerate: false,
    });
    onReset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Muscle Groups Selection */}
        <FormField
          control={form.control}
          name="targetMuscleGroups"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Target Muscle Groups</FormLabel>
              <FormDescription>
                Select the muscle groups you want to focus on today (optional).
              </FormDescription>
              <FormControl>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MUSCLE_GROUPS.map((muscleGroup) => (
                    <div key={muscleGroup.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={muscleGroup.id}
                        checked={selectedMuscleGroups.includes(muscleGroup.id)}
                        onCheckedChange={() => toggleMuscleGroup(muscleGroup.id)}
                      />
                      <label
                        htmlFor={muscleGroup.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {muscleGroup.label}
                      </label>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Workout Type */}
        <FormField
          control={form.control}
          name="workoutType"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Workout Type</FormLabel>
              <FormDescription>
                Choose the type of workout you want to do today.
              </FormDescription>
              <FormControl>
                <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-labelledby="workout-type-label">
                  {WORKOUT_TYPES.map((workoutType) => (
                    <Card
                      key={workoutType.id}
                      className={`cursor-pointer transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary ${
                        selectedWorkoutType === workoutType.id
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleWorkoutTypeChange(workoutType.id as WorkoutType)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <input
                              type="radio"
                              id={`workout-type-${workoutType.id}`}
                              name="workoutType"
                              value={workoutType.id}
                              checked={selectedWorkoutType === workoutType.id}
                              onChange={() => handleWorkoutTypeChange(workoutType.id as WorkoutType)}
                              className="sr-only"
                            />
                            <label htmlFor={`workout-type-${workoutType.id}`} className="cursor-pointer block">
                              <h4 className="font-medium">{workoutType.label}</h4>
                              <p className="text-sm text-muted-foreground">{workoutType.description}</p>
                            </label>
                          </div>
                          {selectedWorkoutType === workoutType.id && (
                            <div className="h-4 w-4 rounded-full bg-primary" aria-hidden="true" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Fitness Level */}
        <FormField
          control={form.control}
          name="fitnessLevel"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Fitness Level</FormLabel>
              <FormDescription>
                Choose your current fitness level to get appropriate exercises.
              </FormDescription>
              <FormControl>
                <div className="grid grid-cols-1 gap-3">
                  {LEVELS.map((level) => (
                    <Card
                      key={level.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedLevel === level.id
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleLevelChange(level.id as FitnessLevel)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{level.label}</h4>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                          {selectedLevel === level.id && (
                            <div className="h-4 w-4 rounded-full bg-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Equipment Selection */}
        <FormField
          control={form.control}
          name="availableEquipment"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Available Equipment</FormLabel>
              <FormDescription>
                Select all equipment you have access to. Leave empty for bodyweight only.
              </FormDescription>
              <FormControl>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <div key={equipment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment.id}
                        checked={selectedEquipment.includes(equipment.id)}
                        onCheckedChange={() => toggleEquipment(equipment.id)}
                      />
                      <label
                        htmlFor={equipment.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {equipment.label}
                      </label>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Duration */}
        <FormField
          control={form.control}
          name="targetDuration"
          render={() => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Workout Duration: {duration[0]} minutes
              </FormLabel>
              <FormDescription>
                How much time do you have for your workout today?
              </FormDescription>
              <FormControl>
                <div className="px-2">
                  <Slider
                    value={duration}
                    onValueChange={handleDurationChange}
                    max={90}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>15 min</span>
                    <span>90 min</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading || selectedEquipment.length === 0}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate Workout
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}