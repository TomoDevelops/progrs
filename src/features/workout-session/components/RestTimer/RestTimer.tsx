"use client";

import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Play, Pause, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { usePersistedTimer } from "@/shared/hooks/usePersistedTimer";

interface RestTimerProps {
  restTimeSeconds: number;
  onComplete: () => void;
  onCancel: () => void;
  isActive: boolean;
  className?: string;
  resetTrigger?: number; // Add trigger to force reset when new record is input
}

export function RestTimer({
  restTimeSeconds,
  onComplete,
  onCancel,
  isActive,
  className,
  resetTrigger,
}: RestTimerProps) {
  const prevResetTriggerRef = useRef<number | undefined>(resetTrigger);
  const {
    timeLeft,
    isRunning,
    isCompleted,
    progressPercentage,
    start,
    pause,
    reset,
    toggle,
  } = usePersistedTimer({
    initialTime: restTimeSeconds,
    onComplete,
    autoStart: false,
    storageKey: "workout-rest-timer",
  });

  // Handle reset trigger changes (new record input)
  useEffect(() => {
    if (
      resetTrigger !== undefined &&
      resetTrigger !== prevResetTriggerRef.current
    ) {
      // Force reset when new record is input, even if timer is running
      reset(restTimeSeconds);
      prevResetTriggerRef.current = resetTrigger;
    }
  }, [resetTrigger, restTimeSeconds, reset]);

  // Handle active state changes
  useEffect(() => {
    if (isActive) {
      // Only start if not already running (avoid interrupting ongoing timer)
      if (!isRunning && !isCompleted) {
        reset(restTimeSeconds);
        start();
      }
      return;
    }
    pause();
  }, [isActive, restTimeSeconds, reset, start, pause, isRunning, isCompleted]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const handlePlayPause = () => {
    if (isCompleted) return;
    toggle();
  };

  const handleCancel = () => {
    pause();
    onCancel();
  };

  // Always show the timer, but only run when active

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Timer Display */}
          <div className="flex items-center space-x-4">
            <div className="relative h-16 w-16">
              {/* Progress Circle */}
              <svg
                className="h-16 w-16 -rotate-90 transform"
                viewBox="0 0 120 120"
              >
                {/* Background Circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted-foreground/20"
                />
                {/* Progress Circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercentage / 100)}`}
                  className={cn(
                    "transition-all duration-1000 ease-linear",
                    isCompleted ? "text-green-500" : "text-primary",
                  )}
                  strokeLinecap="round"
                />
              </svg>

              {/* Time Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={cn(
                    "text-lg font-bold tabular-nums",
                    isCompleted ? "text-green-500" : "text-foreground",
                  )}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Status and Time Info */}
            <div>
              <p className="text-sm font-medium">
                {isCompleted
                  ? "Rest Complete!"
                  : isRunning
                    ? "Rest Timer"
                    : isActive
                      ? "Rest Paused"
                      : "Rest Timer"}
              </p>
              <p className="text-muted-foreground text-xs">
                {isCompleted
                  ? "Ready for next set"
                  : isRunning
                    ? "Resting..."
                    : isActive
                      ? "Timer paused"
                      : "Complete a set to start timer"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {isActive && !isCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
                className="flex h-8 items-center space-x-1 px-3"
              >
                {isRunning && (
                  <>
                    <Pause className="h-3 w-3" />
                    <span className="text-xs">Pause</span>
                  </>
                )}
                {!isRunning && (
                  <>
                    <Play className="h-3 w-3" />
                    <span className="text-xs">Resume</span>
                  </>
                )}
              </Button>
            )}

            {isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-destructive hover:text-destructive flex h-8 items-center space-x-1 px-3"
              >
                <X className="h-3 w-3" />
                <span className="text-xs">
                  {isCompleted ? "Close" : "Skip"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
