export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
