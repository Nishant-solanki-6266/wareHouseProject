export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  errors?: unknown[];
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    ...(message ? { message } : {}),
    data,
  };
}

export function createdResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    ...(message ? { message } : {}),
    data,
  };
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string
): ApiResponse<T[]> {
  return {
    success: true,
    ...(message ? { message } : {}),
    data,
    pagination,
  };
}

export function errorResponse(message: string, errors: unknown[] = []): ApiResponse<null> {
  return {
    success: false,
    message,
    errors,
  };
}
