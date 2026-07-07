export type { ApiResponse, ApiError, PaginatedResponse, PaginationParams } from "./api"

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type AsyncFn<T = void> = () => Promise<T>
