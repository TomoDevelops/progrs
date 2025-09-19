import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient, type ApiRequestConfig, ApiError, handleApiError } from "@/shared/lib/api-client";
import type { ListQueryParams, PaginatedApiResponse } from "@/shared/types/api";

/**
 * Configuration for useApiQuery hook
 */
export interface UseApiQueryConfig<T> extends Omit<UseQueryOptions<T>, 'queryFn' | 'queryKey'> {
  /** API request configuration */
  requestConfig?: ApiRequestConfig;
  /** Whether to show error toasts (overrides requestConfig) */
  showErrorToast?: boolean;
}

/**
 * Configuration for useApiMutation hook
 */
export interface UseApiMutationConfig<TData, TVariables> extends Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> {
  /** API request configuration */
  requestConfig?: ApiRequestConfig;
  /** Whether to show success toasts */
  showSuccessToast?: boolean;
  /** Whether to show error toasts */
  showErrorToast?: boolean;
  /** Custom success message */
  successMessage?: string;
  /** Query keys to invalidate on success */
  invalidateQueries?: string[][];
}

/**
 * Hook for GET requests with TanStack Query integration
 */
export function useApiQuery<T = unknown>(
  queryKey: string[],
  endpoint: string,
  config: UseApiQueryConfig<T> = {},
) {
  const { requestConfig, showErrorToast = false, ...queryOptions } = config;

  return useQuery({
    queryKey,
    queryFn: async () => {
      return apiClient.get<T>(endpoint, {
        ...requestConfig,
        showErrorToast,
      });
    },
    ...queryOptions,
  });
}

/**
 * Hook for mutations (POST, PUT, PATCH, DELETE) with TanStack Query integration
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: UseApiMutationConfig<TData, TVariables> = {},
) {
  const queryClient = useQueryClient();
  const {
    invalidateQueries = [],
    onSuccess,
    onError,
    ...mutationOptions
  } = config;

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate specified queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Call custom onSuccess if provided
      onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      // Call custom onError if provided
      onError?.(error, variables, onMutateResult, context);
    },
    ...mutationOptions,
  });
}

/**
 * Hook for POST requests
 */
export function useApiPost<TData = unknown, TVariables = unknown>(
  endpoint: string,
  config: UseApiMutationConfig<TData, TVariables> = {},
) {
  return useApiMutation(
    (variables: TVariables) => {
      return apiClient.post<TData>(endpoint, variables, {
        ...config.requestConfig,
        showSuccessToast: config.showSuccessToast,
        showErrorToast: config.showErrorToast,
        successMessage: config.successMessage,
      });
    },
    config,
  );
}

/**
 * Hook for PUT requests
 */
export function useApiPut<TData = unknown, TVariables = unknown>(
  endpoint: string,
  config: UseApiMutationConfig<TData, TVariables> = {},
) {
  return useApiMutation(
    (variables: TVariables) => {
      return apiClient.put<TData>(endpoint, variables, {
        ...config.requestConfig,
        showSuccessToast: config.showSuccessToast,
        showErrorToast: config.showErrorToast,
        successMessage: config.successMessage,
      });
    },
    config,
  );
}

/**
 * Hook for PATCH requests
 */
export function useApiPatch<TData = unknown, TVariables = unknown>(
  endpoint: string,
  config: UseApiMutationConfig<TData, TVariables> = {},
) {
  return useApiMutation(
    (variables: TVariables) => {
      return apiClient.patch<TData>(endpoint, variables, {
        ...config.requestConfig,
        showSuccessToast: config.showSuccessToast,
        showErrorToast: config.showErrorToast,
        successMessage: config.successMessage,
      });
    },
    config,
  );
}

/**
 * Hook for DELETE requests
 */
export function useApiDelete<TData = unknown>(
  endpoint: string,
  config: UseApiMutationConfig<TData, void> = {},
) {
  return useApiMutation(
    () => {
      return apiClient.delete<TData>(endpoint, {
        ...config.requestConfig,
        showSuccessToast: config.showSuccessToast,
        showErrorToast: config.showErrorToast,
        successMessage: config.successMessage,
      });
    },
    config,
  );
}

/**
 * Hook for paginated list queries
 */
export function useApiList<T = unknown>(
  queryKey: string[],
  endpoint: string,
  params: ListQueryParams = {},
  config: UseApiQueryConfig<PaginatedApiResponse<T>> = {},
) {
  const queryParams = new URLSearchParams();
  
  // Add pagination params
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());
  
  // Add sorting params
  if (params.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
  
  // Add filter params
  if (params.search) queryParams.set('search', params.search);
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.set(key, String(value));
      }
    });
  }

  const queryString = queryParams.toString();
  const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

  return useApiQuery<PaginatedApiResponse<T>>(
    [...queryKey, 'list', JSON.stringify(params)],
    fullEndpoint,
    config,
  );
}

/**
 * Hook for infinite queries (useful for pagination)
 */
export function useApiInfiniteQuery<T = unknown>(
  queryKey: string[],
  endpoint: string,
  config: UseApiQueryConfig<T> = {},
) {
  // This would require useInfiniteQuery from TanStack Query
  // Implementation depends on specific pagination strategy
  // For now, we'll use the regular useApiQuery
  return useApiQuery<T>(queryKey, endpoint, config);
}

/**
 * Utility hook to get error message from API error
 */
export function useApiErrorHandler() {
  return {
    getErrorMessage: handleApiError,
    isApiError: (error: unknown): error is ApiError => error instanceof ApiError,
  };
}