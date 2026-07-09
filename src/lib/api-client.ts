import axios, { isAxiosError } from "axios"
import type { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from "axios"
import type { PaginatedResponse, PaginationParams } from "@/types"

// Backend envelope: every successful response is wrapped as { data, timestamp }.
export interface ApiSuccessEnvelope<T> {
  data: T
  timestamp: string
}

// Backend error body shape (e.g. from a global exception filter).
export interface ApiErrorBody {
  statusCode: number
  timestamp: string
  path: string
  message: string | string[]
}

export type RequestConfig = AxiosRequestConfig

// Normalized error thrown by every ApiClient method — callers never see AxiosError directly.
export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string = "UNKNOWN"
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}

function normalizeError(err: unknown): ApiClientError {
  if (err instanceof ApiClientError) return err

  if (isAxiosError<ApiErrorBody>(err)) {
    if (err.response?.data) {
      const body = err.response.data
      const message = Array.isArray(body.message) ? body.message[0] : body.message
      return new ApiClientError(body.statusCode ?? err.response.status, message, "API_ERROR")
    }
    if (err.code === "ECONNABORTED") {
      return new ApiClientError(408, "Request timed out. Please try again.", "TIMEOUT")
    }
    return new ApiClientError(0, err.message ?? "Network error", "NETWORK_ERROR")
  }

  if (err instanceof Error) return new ApiClientError(0, err.message, "UNKNOWN")
  return new ApiClientError(0, "An unexpected error occurred.", "UNKNOWN")
}

/**
 * Facade quanh Axios dùng chung cho mọi feature.
 * Không import axios trực tiếp ở nơi khác — luôn đi qua class này.
 */
export class ApiClient {
  private readonly instance: AxiosInstance

  constructor(config: CreateAxiosDefaults) {
    this.instance = axios.create(config)
  }

  private unwrap<T>(body: unknown): T {
    if (body && typeof body === "object" && "data" in body) {
      return (body as ApiSuccessEnvelope<T>).data
    }
    return body as T
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    try {
      const res = await this.instance.request<ApiSuccessEnvelope<T> | T>(config)
      return this.unwrap<T>(res.data)
    } catch (err) {
      throw normalizeError(err)
    }
  }

  get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url })
  }

  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data })
  }

  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "PUT", url, data })
  }

  patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH", url, data })
  }

  delete<T = void>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE", url })
  }

  // Upload File hoặc FormData — File tự động được wrap vào FormData với key "file".
  upload<T>(url: string, payload: File | FormData, config?: RequestConfig): Promise<T> {
    const formData =
      payload instanceof File
        ? (() => {
            const fd = new FormData()
            fd.append("file", payload)
            return fd
          })()
        : payload

    return this.request<T>({
      ...config,
      method: "POST",
      url,
      data: formData,
      headers: { ...config?.headers, "Content-Type": "multipart/form-data" },
    })
  }

  getPaginated<T>(
    url: string,
    params?: PaginationParams,
    config?: RequestConfig
  ): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(url, { ...config, params })
  }
}
