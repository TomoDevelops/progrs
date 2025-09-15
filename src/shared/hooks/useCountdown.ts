"use client";

import { useState, useEffect, useRef } from "react";

interface UseCountdownOptions {
  onComplete?: () => void;
}

interface UseCountdownReturn {
  countdown: number;
  isActive: boolean;
  start: (seconds: number) => void;
  stop: () => void;
  reset: () => void;
}

export const useCountdown = ({ onComplete }: UseCountdownOptions = {}): UseCountdownReturn => {
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Update the callback ref when onComplete changes
  onCompleteRef.current = onComplete;

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = (seconds: number) => {
    clearTimer();
    setCountdown(seconds);
    
    if (seconds > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          const newCount = prev - 1;
          if (newCount <= 0) {
            clearTimer();
            // Call onComplete in next tick to avoid state update during render
            setTimeout(() => onCompleteRef.current?.(), 0);
            return 0;
          }
          return newCount;
        });
      }, 1000);
    }
  };

  const stop = () => {
    clearTimer();
    setCountdown(0);
  };

  const reset = () => {
    clearTimer();
    setCountdown(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, []);

  const isActive = countdown > 0;

  return {
    countdown,
    isActive,
    start,
    stop,
    reset,
  };
};