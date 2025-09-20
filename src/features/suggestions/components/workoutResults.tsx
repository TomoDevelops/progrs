"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { 
  Clock, 
  Target, 
  Dumbbell, 
  RotateCcw, 
  RefreshCw, 
  Play, 
  Zap,
  Loader2
} from "lucide-react";
import type { GeneratedWorkout, GeneratedExercise } from "@/features/suggestions/schemas/ai-workout.schemas";

interface WorkoutResultsProps {
  workout: GeneratedWorkout;
  onRegenerate: () => void;
  onReset: () => void;
  isRegenerating: boolean;
}

export function WorkoutResults({ workout, onRegenerate, onReset, isRegenerating }: WorkoutResultsProps) {
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const toggleExerciseComplete = (exerciseId: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }
    setCompletedExercises(newCompleted);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatReps = (exercise: GeneratedExercise) => {
    if (exercise.minReps && exercise.maxReps) {
      return `${exercise.minReps}-${exercise.maxReps} reps`;
    }
    if (exercise.duration) {
      return `${exercise.duration}s`;
    }
    if (exercise.distance) {
      return `${exercise.distance}m`;
    }
    return "As prescribed";
  };

  const formatRestTime = (seconds: number) => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">{workout.name}</h3>
            {workout.description && (
              <p className="text-sm text-muted-foreground mt-1">{workout.description}</p>
            )}
          </div>
          {workout.fromCache && (
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Cached
            </Badge>
          )}
        </div>

        {/* Workout Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Duration
            </div>
            <p className="text-lg font-semibold">{formatDuration(workout.estimatedDuration)}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Exercises
            </div>
            <p className="text-lg font-semibold">{workout.exercises.length}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Dumbbell className="h-4 w-4" />
              Level
            </div>
            <p className="text-lg font-semibold capitalize">{workout.difficulty}</p>
          </div>
        </div>

        {/* Tags */}
        {workout.tags && workout.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {workout.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Exercise List */}
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Exercises</h4>
            <div className="text-sm text-muted-foreground">
              {completedExercises.size} of {workout.exercises.length} completed
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(completedExercises.size / workout.exercises.length) * 100}%` }}
            />
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {workout.exercises
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((exercise, index) => {
                const isCompleted = completedExercises.has(exercise.id);
                return (
                  <Card 
                    key={exercise.id} 
                    className={`transition-all cursor-pointer hover:shadow-md ${
                      isCompleted ? "bg-green-50 border-green-200" : ""
                    }`}
                    onClick={() => toggleExerciseComplete(exercise.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => toggleExerciseComplete(exercise.id)}
                            aria-label={`Mark ${exercise.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                #{index + 1}
                              </span>
                              <h5 className={`font-medium ${
                                isCompleted ? "line-through text-muted-foreground" : ""
                              }`}>
                                {exercise.name}
                              </h5>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">
                              {exercise.equipment}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Sets: </span>
                              <span className="font-medium">{exercise.sets}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Reps: </span>
                              <span className="font-medium">{formatReps(exercise)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rest: </span>
                              <span className="font-medium">{formatRestTime(exercise.restTime)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Muscle: </span>
                              <span className="font-medium capitalize">{exercise.muscleGroup}</span>
                            </div>
                          </div>
                          
                          {exercise.targetWeight && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Target Weight: </span>
                              <span className="font-medium">{exercise.targetWeight}kg</span>
                            </div>
                          )}
                          
                          {exercise.notes && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium">Notes: </span>
                              {exercise.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </ScrollArea>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={onRegenerate} 
          disabled={isRegenerating}
          variant="outline"
          className="flex-1"
        >
          {isRegenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New
            </>
          )}
        </Button>
        
        <Button 
          onClick={onReset} 
          variant="outline"
          disabled={isRegenerating}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
        
        <Button className="flex-1">
          <Play className="mr-2 h-4 w-4" />
          Start Workout
        </Button>
      </div>
    </div>
  );
}