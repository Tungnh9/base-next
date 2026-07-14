import type { ApiClient, RequestConfig } from "./api-client"
import type { PaginatedResponse, PaginationParams } from "@/types"

/**
 * Base class cho feature service muốn gọi API theo style get/post/put/patch/delete
 * thay vì tự khai báo method + headers mỗi lần (dùng qua serverApi/clientApi hiện có).
 *
 * Subclass chỉ cần cung cấp basePath, method HTTP đã có sẵn ở đây.
 */
export abstract class BaseApiService {
  constructor(
    protected readonly client: ApiClient,
    protected readonly basePath: string
  ) {}

  protected url(path: string = ""): string {
    return `${this.basePath}${path}`
  }

  protected get<T>(path: string = "", config?: RequestConfig): Promise<T> {
    return this.client.get<T>(this.url(path), config)
  }

  protected post<T>(path: string = "", data?: unknown, config?: RequestConfig): Promise<T> {
    return this.client.post<T>(this.url(path), data, config)
  }

  protected put<T>(path: string = "", data?: unknown, config?: RequestConfig): Promise<T> {
    return this.client.put<T>(this.url(path), data, config)
  }

  protected patch<T>(path: string = "", data?: unknown, config?: RequestConfig): Promise<T> {
    return this.client.patch<T>(this.url(path), data, config)
  }

  protected delete<T = void>(
    path: string = "",
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.client.delete<T>(this.url(path), data, config)
  }

  protected upload<T>(
    path: string = "",
    payload: File | FormData,
    config?: RequestConfig
  ): Promise<T> {
    return this.client.upload<T>(this.url(path), payload, config)
  }

  protected getPaginated<T>(
    path: string = "",
    params?: PaginationParams,
    config?: RequestConfig
  ): Promise<PaginatedResponse<T>> {
    return this.client.getPaginated<T>(this.url(path), params, config)
  }
}
