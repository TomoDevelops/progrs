"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Play, Pause, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface RestTimerProps {
  restTimeSeconds: number;
  onComplete: () => void;
  onCancel: () => void;
  isActive: boolean;
  className?: string;
}

export function RestTimer({
  restTimeSeconds,
  onComplete,
  onCancel,
  isActive,
  className,
}: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(restTimeSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Reset timer when restTimeSeconds changes or when isActive becomes true
  useEffect(() => {
    if (isActive) {
      setTimeLeft(restTimeSeconds);
      setIsRunning(true);
      setIsCompleted(false);
    } else {
      // When not active, show full time but don't run
      setTimeLeft(restTimeSeconds);
      setIsRunning(false);
      setIsCompleted(false);
    }
  }, [isActive, restTimeSeconds]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const progressPercentage = ((restTimeSeconds - timeLeft) / restTimeSeconds) * 100;

  // Timer effect
  useEffect(() => {
    if (!isRunning || timeLeft <= 0 || isCompleted || !isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsCompleted(true);
          setIsRunning(false);
          // Use setTimeout to avoid state update during render
          setTimeout(() => onComplete(), 0);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isCompleted, isActive, timeLeft, onComplete]);

  const handlePlayPause = () => {
    if (isCompleted) return;
    setIsRunning(!isRunning);
  };

  const handleCancel = () => {
    setIsRunning(false);
    onCancel();
  };

  // Always show the timer, but only run when active

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Timer Display */}
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16">
              {/* Progress Circle */}
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 120 120">
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
                    isCompleted ? "text-green-500" : "text-primary"
                  )}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Time Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn(
                  "text-lg font-bold tabular-nums",
                  isCompleted ? "text-green-500" : "text-foreground"
                )}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            
            {/* Status and Time Info */}
            <div>
              <p className="text-sm font-medium">
                {isCompleted ? "Rest Complete!" : isRunning ? "Rest Timer" : isActive ? "Rest Paused" : "Rest Timer"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isCompleted ? "Ready for next set" : isRunning ? "Resting..." : isActive ? "Timer paused" : "Complete a set to start timer"}
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
                className="flex items-center space-x-1 h-8 px-3"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span className="text-xs">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
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
                className="flex items-center space-x-1 text-destructive hover:text-destructive h-8 px-3"
              >
                <X className="w-3 h-3" />
                <span className="text-xs">{isCompleted ? "Close" : "Skip"}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}