"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UsePersistedTimerOptions {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
  storageKey?: string;
}

interface UsePersistedTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  isCompleted: boolean;
  progressPercentage: number;
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
  toggle: () => void;
}

interface TimerState {
  startTime: number;
  duration: number;
  isRunning: boolean;
  isCompleted: boolean;
}

export const usePersistedTimer = ({
  initialTime,
  onComplete,
  autoStart = false,
  storageKey = "rest-timer",
}: UsePersistedTimerOptions): UsePersistedTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const startTimeRef = useRef<number | null>(null);
  const durationRef = useRef(initialTime);

  // Update the callback ref when onComplete changes
  onCompleteRef.current = onComplete;

  // Generate unique storage key based on current session
  const getStorageKey = useCallback(() => {
    return `${storageKey}-${Date.now()}`;
  }, [storageKey]);

  // Save timer state to localStorage
  const saveTimerState = useCallback(
    (state: TimerState) => {
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(state));
      } catch (error) {
        console.warn("Failed to save timer state to localStorage:", error);
      }
    },
    [getStorageKey],
  );

  // Load timer state from localStorage
  const loadTimerState = useCallback((): TimerState | null => {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(storageKey),
      );
      if (keys.length === 0) return null;

      // Get the most recent timer state
      const latestKey = keys.sort().pop();
      if (!latestKey) return null;

      const saved = localStorage.getItem(latestKey);
      if (!saved) return null;

      return JSON.parse(saved) as TimerState;
    } catch (error) {
      console.warn("Failed to load timer state from localStorage:", error);
      return null;
    }
  }, [storageKey]);

  // Clear timer state from localStorage
  const clearTimerState = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(storageKey),
      );
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Failed to clear timer state from localStorage:", error);
    }
  }, [storageKey]);

  // Calculate remaining time based on start time and duration
  const calculateTimeLeft = useCallback(
    (startTime: number, duration: number): number => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      return Math.max(0, duration - elapsed);
    },
    [],
  );

  // Clear interval
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start timer
  const start = useCallback(() => {
    if (isCompleted || timeLeft <= 0) return;

    const now = Date.now();
    startTimeRef.current = now;
    durationRef.current = timeLeft;
    setIsRunning(true);

    // Save state to localStorage
    saveTimerState({
      startTime: now,
      duration: timeLeft,
      isRunning: true,
      isCompleted: false,
    });
  }, [isCompleted, timeLeft, saveTimerState]);

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimer();

    // Update localStorage with paused state
    if (startTimeRef.current) {
      const remaining = calculateTimeLeft(
        startTimeRef.current,
        durationRef.current,
      );
      saveTimerState({
        startTime: Date.now(),
        duration: remaining,
        isRunning: false,
        isCompleted: false,
      });
    }
  }, [clearTimer, calculateTimeLeft, saveTimerState]);

  // Toggle timer
  const toggle = useCallback(() => {
    if (isCompleted) return;
    if (isRunning) {
      pause();
      return;
    }
    start();
  }, [isCompleted, isRunning, pause, start]);

  // Reset timer
  const reset = useCallback(
    (newTime?: number) => {
      clearTimer();
      clearTimerState();

      const resetTime = newTime ?? initialTime;
      setTimeLeft(resetTime);
      setIsRunning(autoStart);
      setIsCompleted(false);
      startTimeRef.current = null;
      durationRef.current = resetTime;

      if (autoStart) {
        const now = Date.now();
        startTimeRef.current = now;
        saveTimerState({
          startTime: now,
          duration: resetTime,
          isRunning: true,
          isCompleted: false,
        });
      }
    },
    [initialTime, autoStart, clearTimer, clearTimerState, saveTimerState],
  );

  // Handle timer completion
  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    setIsRunning(false);
    setTimeLeft(0);
    clearTimer();
    clearTimerState();

    // Call onComplete in next tick to avoid state update during render
    setTimeout(() => onCompleteRef.current?.(), 0);
  }, [clearTimer, clearTimerState]);

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning || timeLeft <= 0 || isCompleted) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const remaining = calculateTimeLeft(
          startTimeRef.current,
          durationRef.current,
        );
        setTimeLeft(remaining);

        if (remaining <= 0) {
          handleComplete();
        }
      }
    }, 100); // Update more frequently for smoother UI

    return clearTimer;
  }, [
    isRunning,
    timeLeft,
    isCompleted,
    clearTimer,
    calculateTimeLeft,
    handleComplete,
  ]);

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadTimerState();
    if (savedState && !isCompleted) {
      const remaining = calculateTimeLeft(
        savedState.startTime,
        savedState.duration,
      );

      if (remaining > 0) {
        setTimeLeft(remaining);
        setIsRunning(savedState.isRunning);
        startTimeRef.current = savedState.startTime;
        durationRef.current = savedState.duration;

        if (savedState.isRunning) {
          // Timer was running when saved, continue it
          setIsRunning(true);
        }
        return;
      }
      // Timer has completed while away
      handleComplete();
    }
  }, [loadTimerState, calculateTimeLeft, handleComplete, isCompleted]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && startTimeRef.current) {
        // Recalculate time when page becomes visible
        const remaining = calculateTimeLeft(
          startTimeRef.current,
          durationRef.current,
        );
        setTimeLeft(remaining);

        if (remaining <= 0) {
          handleComplete();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRunning, calculateTimeLeft, handleComplete]);

  // Reset when initialTime changes
  useEffect(() => {
    reset(initialTime);
  }, [initialTime, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (isCompleted) {
        clearTimerState();
      }
    };
  }, [clearTimer, clearTimerState, isCompleted]);

  const progressPercentage =
    durationRef.current > 0
      ? ((durationRef.current - timeLeft) / durationRef.current) * 100
      : 0;

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
