import { env } from "@/lib/env"
import { ApiClient, ApiClientError } from "@/lib/api-client"
import type { ApiResponse } from "@/types"

// Two instances mirroring the existing server/client split:
// serverHttpClient talks to the real backend URL (server-only env var).
// browserHttpClient talks to whatever URL is reachable from the browser.
const serverHttpClient = new ApiClient({ baseURL: env.API_BASE_URL, timeout: 15_000 })
const browserHttpClient = new ApiClient({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL ?? env.API_BASE_URL,
  timeout: 15_000,
})

// Re-exported so future features can write `class XService extends BaseApiService`
// against the same underlying clients instead of going through serverApi/clientApi.
export { serverHttpClient, browserHttpClient }
export { BaseApiService } from "@/lib/base-api.service"

async function execute<T>(
  client: ApiClient,
  path: string,
  init: RequestInit | undefined,
  token: string | undefined
): Promise<ApiResponse<T>> {
  const method = (init?.method ?? "GET").toUpperCase()
  const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  }

  try {
    let data: T
    switch (method) {
      case "POST":
        data = await client.post<T>(path, body, { headers })
        break
      case "PUT":
        data = await client.put<T>(path, body, { headers })
        break
      case "PATCH":
        data = await client.patch<T>(path, body, { headers })
        break
      case "DELETE":
        data = await client.delete<T>(path, { headers })
        break
      default:
        data = await client.get<T>(path, { headers })
    }
    return { data, error: null }
  } catch (err) {
    if (err instanceof ApiClientError) {
      return { data: null, error: { message: err.message, code: err.code, status: err.status } }
    }
    return {
      data: null,
      error: { message: "Network error", code: "NETWORK_ERROR", status: 0 },
    }
  }
}

// Server-side calls (Server Actions, Route Handlers)
// Reads session JWT from cookie, extracts the backend accessToken stored within
export async function serverApi<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const { cookies } = await import("next/headers")
  const { verifyToken } = await import("@/lib/auth")
  const cookieStore = await cookies()
  const sessionJwt = cookieStore.get(env.SESSION_COOKIE_NAME)?.value
  const session = sessionJwt ? await verifyToken(sessionJwt) : null
  return execute<T>(serverHttpClient, path, init, session?.accessToken)
}

// Client-side calls (React components)
// Token must be passed explicitly or read from a store
export async function clientApi<T>(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<ApiResponse<T>> {
  return execute<T>(browserHttpClient, path, init, token)
}
