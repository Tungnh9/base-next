export type { ApiResponse, ApiError, PaginatedResponse, PaginationParams } from "./api";

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFn<T = void> = () => Promise<T>;

// Lấy kiểu của một promise
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
