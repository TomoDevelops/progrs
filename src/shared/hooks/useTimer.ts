"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseTimerOptions {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  isCompleted: boolean;
  progressPercentage: number;
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
  toggle: () => void;
}

export const useTimer = ({
  initialTime,
  onComplete,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Update the callback ref when onComplete changes
  onCompleteRef.current = onComplete;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isCompleted || timeLeft <= 0) return;
    setIsRunning(true);
  }, [isCompleted, timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (isCompleted) return;
    setIsRunning(prev => !prev);
  }, [isCompleted]);

  const reset = useCallback((newTime?: number) => {
    clearTimer();
    const resetTime = newTime ?? initialTime;
    setTimeLeft(resetTime);
    setIsRunning(autoStart);
    setIsCompleted(false);
  }, [initialTime, autoStart, clearTimer]);

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning || timeLeft <= 0 || isCompleted) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsCompleted(true);
          setIsRunning(false);
          // Call onComplete in next tick to avoid state update during render
          setTimeout(() => onCompleteRef.current?.(), 0);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, timeLeft, isCompleted, clearTimer]);

  // Reset when initialTime changes
  useEffect(() => {
    reset(initialTime);
  }, [initialTime, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const progressPercentage = ((initialTime - timeLeft) / initialTime) * 100;

  return {
    timeLeft,
    isRunning,
    isCompleted,
    progressPercentage,
    start,
    pause,
    reset,
    toggle,
  };
};