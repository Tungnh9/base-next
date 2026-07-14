import { env } from "@/lib/env"
import type { ApiResponse, ApiError } from "@/types"

export const USE_MOCK_API = env.NEXT_PUBLIC_USE_MOCK_API

// Wraps a fixture value in the same ApiResponse<T> shape serverApi/clientApi return,
// with an artificial delay so loading states are visible during development.
export async function mockApi<T>(data: T, delayMs = 400): Promise<ApiResponse<T>> {
  await new Promise((resolve) => setTimeout(resolve, delayMs))
  return { data, error: null }
}

// Same idea for the failure branch — build an ApiError-shaped response.
export async function mockApiError(error: ApiError, delayMs = 400): Promise<ApiResponse<never>> {
  await new Promise((resolve) => setTimeout(resolve, delayMs))
  return { data: null, error }
}
