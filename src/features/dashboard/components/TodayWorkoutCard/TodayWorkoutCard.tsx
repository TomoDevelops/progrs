"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Clock,
  Dumbbell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import type { TodayWorkoutData } from "@/app/api/dashboard/repository/dashboard.repository";

interface TodayWorkoutCardProps {
  workouts: TodayWorkoutData[];
  selectedIndex?: number;
  onWorkoutIndexChange?: (index: number) => void;
}

export function TodayWorkoutCard({ 
  workouts, 
  selectedIndex = 0, 
  onWorkoutIndexChange 
}: TodayWorkoutCardProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentWorkoutIndex = onWorkoutIndexChange ? selectedIndex : internalIndex;
  const setCurrentWorkoutIndex = onWorkoutIndexChange || setInternalIndex;
  if (!workouts || workouts.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Workout
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Dumbbell className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No workout planned</h3>
          <p className="text-muted-foreground text-center text-sm">
            You don&apos;t have any workouts scheduled for today. Create a
            routine to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentWorkout = workouts[currentWorkoutIndex];
  const hasMultipleWorkouts = workouts.length > 1;

  const handlePrevious = () => {
    const newIndex = currentWorkoutIndex === 0 ? workouts.length - 1 : currentWorkoutIndex - 1;
    setCurrentWorkoutIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentWorkoutIndex === workouts.length - 1 ? 0 : currentWorkoutIndex + 1;
    setCurrentWorkoutIndex(newIndex);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Workout
            {hasMultipleWorkouts && (
              <Badge variant="secondary" className="ml-2">
                {currentWorkoutIndex + 1} of {workouts.length}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Workout */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold">{currentWorkout.name}</h3>
            {currentWorkout.description && (
              <p className="text-muted-foreground mt-1 text-sm">
                {currentWorkout.description}
              </p>
            )}
          </div>

          {/* Workout Stats */}
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            {currentWorkout.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{currentWorkout.estimatedDuration} min</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              <span>{currentWorkout.exercises.length} exercises</span>
            </div>
          </div>

          {/* Exercise Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Exercises:</h4>
            <div className="flex flex-wrap gap-2">
              {currentWorkout.exercises.slice(0, 3).map((exercise) => (
                <Badge key={exercise.id} variant="outline" className="text-xs">
                  {exercise.name}
                </Badge>
              ))}
              {currentWorkout.exercises.length > 3 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      variant="outline"
                      className="hover:bg-muted/50 cursor-pointer text-xs transition-colors"
                    >
                      <MoreHorizontal className="mr-1 h-3 w-3" />+
                      {currentWorkout.exercises.length - 3} more
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {currentWorkout.exercises.slice(3).map((exercise) => (
                      <DropdownMenuItem key={exercise.id} className="text-xs">
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-muted-foreground ml-auto">
                          {exercise.muscleGroup}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Navigation Controls */}
      {hasMultipleWorkouts && (
        <CardFooter className="mt-auto w-full">
          <div className="flex w-full items-center justify-between">
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Workout Indicators */}
            <div className="flex items-center gap-2">
              {workouts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentWorkoutIndex(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentWorkoutIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to workout ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
