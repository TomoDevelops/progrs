"use client";

import { Button } from "@/shared/components/ui/button";
import { Clock, Trophy } from "lucide-react";

interface SessionHeaderProps {
  workoutName: string;
  routineName?: string;
  duration: number;
  estimatedDuration?: number;
  onFinish: () => void;
  isFinishing: boolean;
}

export function SessionHeader({
  workoutName,
  routineName,
  duration,
  estimatedDuration,
  onFinish,
  isFinishing,
}: SessionHeaderProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const isOverEstimate = estimatedDuration && duration > estimatedDuration;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{workoutName}</h1>
            {routineName && (
              <p className="text-sm text-muted-foreground mt-1">
                From routine: {routineName}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Duration Display */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={isOverEstimate ? "text-orange-600 font-medium" : "text-gray-600"}>
                {formatDuration(duration)}
              </span>
              {estimatedDuration && (
                <span className="text-muted-foreground">
                  / {formatDuration(estimatedDuration)}
                </span>
              )}
            </div>

            {/* Finish Button */}
            <Button
              onClick={onFinish}
              disabled={isFinishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isFinishing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Finishing...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Finish Workout
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}