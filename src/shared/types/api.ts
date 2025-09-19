/**
 * Shared API response types used across all API routes
 */

export type ApiSuccessResponse<T> = {
  success: true;
  data?: T;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  details?: string | string[] | Record<string, unknown>[];
};

/**
 * Helper type for API responses that can be either success or error
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
