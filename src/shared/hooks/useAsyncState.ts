"use client";

import { useState, useCallback } from "react";

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export interface UseAsyncStateOptions<T = unknown> {
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for managing async operations with consistent loading and error states
 * @param options Configuration options for the async state
 * @returns AsyncState object with data, loading, error states and execute function
 */
export function useAsyncState<T = unknown>(
  options: UseAsyncStateOptions<T> = {}
): AsyncState<T> {
  const { initialData = null, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (asyncFn: () => Promise<T>): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await asyncFn();
        setData(result);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}

/**
 * Simplified version of useAsyncState for form submissions
 * @param submitFn The async function to execute on form submission
 * @param options Configuration options
 * @returns Object with isLoading, error, and handleSubmit function
 */
export function useAsyncSubmit<T = unknown>(
  submitFn: (data: T) => Promise<unknown>,
  options: UseAsyncStateOptions<unknown> = {}
) {
  const { isLoading, error, execute, reset } = useAsyncState(options);

  const handleSubmit = useCallback(
    async (data: T) => {
      return await execute(() => submitFn(data));
    },
    [execute, submitFn]
  );

  return {
    isLoading,
    error,
    handleSubmit,
    reset,
  };
}