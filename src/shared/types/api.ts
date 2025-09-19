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

/**
 * Standardized error codes for consistent error handling
 */
export enum ApiErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  
  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  
  // Resource Management
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
  
  // Business Logic
  BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  
  // System
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
}

/**
 * Enhanced error response with structured error information
 */
export interface ApiErrorDetails {
  code: ApiErrorCode;
  message: string;
  field?: string;
  value?: unknown;
  timestamp?: string;
}

/**
 * Enhanced API error response with structured error details
 */
export interface EnhancedApiErrorResponse extends Omit<ApiErrorResponse, 'details'> {
  errorCode: ApiErrorCode;
  details?: ApiErrorDetails[];
  timestamp: string;
  requestId?: string;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated API response
 */
export type PaginatedApiResponse<T> = ApiSuccessResponse<T[]> & {
  pagination: PaginationMeta;
};

/**
 * Query parameters for paginated requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Sorting parameters for list requests
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Filter parameters for list requests
 */
export interface FilterParams {
  search?: string;
  filters?: Record<string, unknown>;
}

/**
 * Combined query parameters for list endpoints
 */
export type ListQueryParams = PaginationParams & SortParams & FilterParams;

/**
 * Standard HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Type guard to check if response is successful
 */
export const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> => {
  return response.success === true;
};

/**
 * Type guard to check if response is an error
 */
export const isApiError = (response: ApiResponse<unknown>): response is ApiErrorResponse => {
  return response.success === false;
};

/**
 * Type guard to check if response is an enhanced error
 */
export const isEnhancedApiError = (response: unknown): response is EnhancedApiErrorResponse => {
  return typeof response === 'object' && response !== null && 'success' in response && 
         'errorCode' in response && (response as Record<string, unknown>).success === false;
};
