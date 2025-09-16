"use client";

import { useEffect } from "react";

interface UseBeforeUnloadOptions {
  enabled: boolean;
  message: string;
}

/**
 * Custom hook to manage beforeunload event listener
 * Provides a cleaner API for preventing page navigation
 */
export const useBeforeUnload = ({
  enabled,
  message,
}: UseBeforeUnloadOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, message]);
};
