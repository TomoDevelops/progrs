"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/shared/components/ui/carousel";
import { Clock, Dumbbell, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { TodayWorkoutData } from "@/app/api/dashboard/repository/dashboard.repository";

interface TodayWorkoutCarouselProps {
  workouts: TodayWorkoutData[];
  onStartWorkout: (workout: TodayWorkoutData) => void;
  isStartingWorkout?: boolean;
}

export function TodayWorkoutCarousel({
  workouts,
  onStartWorkout,
  isStartingWorkout = false,
}: TodayWorkoutCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const handleCarouselApiChange = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) {
      setApi(undefined);
      return;
    }

    setApi(carouselApi);
    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap() + 1);

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    });
  }, []);
  if (!workouts || workouts.length === 0) {
    return (
      <Card className="flex min-h-[320px] w-full flex-col">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Dumbbell className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No Workout Planned</h3>
          <p className="text-muted-foreground text-center">
            You don&apos;t have any workouts scheduled for today. Create a
            routine to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (workouts.length === 1) {
    // Single workout - no carousel needed
    const workout = workouts[0];
    return (
      <Card className="flex min-h-[320px] w-full flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{workout.name}</span>
            <Badge variant="secondary">
              {workout.exercises.length} exercise
              {workout.exercises.length !== 1 ? "s" : ""}
            </Badge>
          </CardTitle>
          {workout.description && (
            <p className="text-muted-foreground text-sm">
              {workout.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="flex flex-1 flex-col space-y-4">
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            {workout.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{workout.estimatedDuration} min</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              <span>{workout.exercises.length} exercises</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-medium">Exercises:</h4>
            <div className="flex flex-wrap gap-2">
              {workout.exercises.slice(0, 3).map((exercise) => (
                <Badge key={exercise.id} variant="outline" className="text-xs">
                  {exercise.name}
                </Badge>
              ))}
              {workout.exercises.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{workout.exercises.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Bottom section with start button */}
          <div className="mt-auto space-y-3">
            {/* Single circle indicator */}
            <div className="flex justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
            </div>

            {/* Button row */}
            <Button
              onClick={() => onStartWorkout(workout)}
              disabled={isStartingWorkout}
              variant="default"
              size="lg"
              radius="default"
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              {isStartingWorkout ? "Starting..." : "Start Workout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Multiple workouts - show carousel
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Today&apos;s Workouts</h3>
        <p className="text-muted-foreground text-sm">
          You have {workouts.length} workouts planned for today. Choose one to
          start:
        </p>
      </div>

      <div className="relative">
        <Carousel setApi={handleCarouselApiChange} className="w-full">
          <CarouselContent>
            {workouts.map(
              (
                workout,
                _index, // eslint-disable-line @typescript-eslint/no-unused-vars
              ) => (
                <CarouselItem key={workout.id}>
                  <Card className="flex min-h-[320px] w-full flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{workout.name}</span>
                        <Badge variant="secondary">
                          {workout.exercises.length} exercise
                          {workout.exercises.length !== 1 ? "s" : ""}
                        </Badge>
                      </CardTitle>
                      {workout.description && (
                        <p className="text-muted-foreground text-sm">
                          {workout.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col space-y-4">
                      <div className="text-muted-foreground flex items-center gap-4 text-sm">
                        {workout.estimatedDuration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{workout.estimatedDuration} min</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-4 w-4" />
                          <span>{workout.exercises.length} exercises</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        <h4 className="text-sm font-medium">Exercises:</h4>
                        <div className="flex flex-wrap gap-2">
                          {workout.exercises.slice(0, 3).map((exercise) => (
                            <Badge
                              key={exercise.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {exercise.name}
                            </Badge>
                          ))}
                          {workout.exercises.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{workout.exercises.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Bottom section with navigation buttons and start button */}
                      <div className="mt-auto space-y-3">
                        {/* Button row */}
                        <div className="flex gap-2">
                          {workouts.length > 1 && (
                            <>
                              <Button
                                variant="outline"
                                size="lg"
                                radius="default"
                                onClick={() => api?.scrollPrev()}
                                disabled={current === 1}
                                className="flex-shrink-0"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => onStartWorkout(workout)}
                                disabled={isStartingWorkout}
                                variant="default"
                                size="lg"
                                radius="default"
                                className="flex-1"
                              >
                                <Play className="mr-2 h-4 w-4" />
                                {isStartingWorkout
                                  ? "Starting..."
                                  : "Start Workout"}
                              </Button>
                              <Button
                                variant="outline"
                                size="lg"
                                radius="default"
                                onClick={() => api?.scrollNext()}
                                disabled={current === count}
                                className="flex-shrink-0"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {workouts.length === 1 && (
                            <Button
                              onClick={() => onStartWorkout(workout)}
                              disabled={isStartingWorkout}
                              className="w-full"
                              size="lg"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              {isStartingWorkout
                                ? "Starting..."
                                : "Start Workout"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ),
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
