import { toast } from "sonner";
import type { ApiResponse } from "@/shared/types/api";
import { getUserTimezone } from "@/shared/utils/date";

/**
 * Configuration options for API requests
 */
export interface ApiRequestConfig extends RequestInit {
  /** Whether to show error toasts automatically */
  showErrorToast?: boolean;
  /** Whether to show success toasts automatically */
  showSuccessToast?: boolean;
  /** Custom success message for toast */
  successMessage?: string;
  /** Whether to include authentication headers */
  requiresAuth?: boolean;
  /** Base URL override */
  baseUrl?: string;
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public response?: ApiResponse<unknown>,
    message?: string,
  ) {
    const errorMessage = message || 
      (response && !response.success ? response.error : undefined) || 
      `HTTP ${status}: ${statusText}`;
    super(errorMessage);
    this.name = 'ApiError';
  }
}

/**
 * Default configuration for API requests
 */
const DEFAULT_CONFIG: ApiRequestConfig = {
  showErrorToast: true,
  showSuccessToast: false,
  requiresAuth: true,
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Centralized API client with standardized error handling and response processing
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a standardized API request
   */
  async request<T = unknown>(
    endpoint: string,
    config: ApiRequestConfig = {},
  ): Promise<T> {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const url = `${mergedConfig.baseUrl || this.baseUrl}${endpoint}`;

    try {
      // Automatically include user timezone in headers
      const userTimezone = getUserTimezone();
      
      const response = await fetch(url, {
        ...mergedConfig,
        headers: {
          ...DEFAULT_CONFIG.headers,
          'x-user-timezone': userTimezone,
          ...mergedConfig.headers,
        },
      });

      const result: ApiResponse<T> = await response.json();

      // Handle API-level errors (success: false)
      if (!result.success) {
        if (mergedConfig.showErrorToast) {
          const errorMessage = result.error || "An error occurred";
          const details = typeof result.details === "string" ? result.details : undefined;
          toast.error(errorMessage, {
            description: details,
          });
        }
        throw new ApiError(response.status, response.statusText, result);
      }

      // Handle HTTP-level errors (4xx, 5xx)
      if (!response.ok) {
        if (mergedConfig.showErrorToast) {
          toast.error(`Request failed: ${response.statusText}`);
        }
        throw new ApiError(response.status, response.statusText, result);
      }

      // Show success toast if configured
      if (mergedConfig.showSuccessToast) {
        const message = mergedConfig.successMessage || result.message || "Success";
        toast.success(message);
      }

      return result.data as T;
    } catch (error) {
      // Handle network errors or JSON parsing errors
      if (error instanceof ApiError) {
        throw error;
      }

      const networkError = error as Error;
      if (mergedConfig.showErrorToast) {
        toast.error("Network error", {
          description: networkError.message,
        });
      }

      throw new ApiError(
        0,
        "Network Error",
        {
          success: false,
          error: "Network error occurred",
          details: networkError.message,
        },
        networkError.message,
      );
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    config?: Omit<ApiRequestConfig, "method" | "body">,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Omit<ApiRequestConfig, "method">,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Omit<ApiRequestConfig, "method">,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Omit<ApiRequestConfig, "method">,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    config?: Omit<ApiRequestConfig, "method" | "body">,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient();

/**
 * Create a new API client with custom base URL
 */
export const createApiClient = (baseUrl: string) => new ApiClient(baseUrl);

/**
 * Utility function for handling API errors in components
 */
export const handleApiError = (error: unknown, fallbackMessage = "An error occurred") => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return fallbackMessage;
};

/**
 * Type guard to check if an error is an ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};