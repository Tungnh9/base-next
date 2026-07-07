import { env } from "@/lib/env"
import type { ApiResponse } from "@/types"

async function apiFetch<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit & { token?: string }
): Promise<ApiResponse<T>> {
  const { token, ...fetchInit } = init ?? {}

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchInit.headers as Record<string, string> | undefined),
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, { ...fetchInit, headers })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return {
        data: null,
        error: {
          message: body.message ?? res.statusText,
          code: body.code ?? "UNKNOWN",
          status: res.status,
        },
      }
    }

    const data: T = await res.json()
    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Network error",
        code: "NETWORK_ERROR",
        status: 0,
      },
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
  const token = session?.accessToken
  return apiFetch<T>(env.API_BASE_URL, path, { ...init, token })
}

// Client-side calls (React components)
// Token must be passed explicitly or read from a store
export async function clientApi<T>(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<ApiResponse<T>> {
  const baseUrl = env.NEXT_PUBLIC_API_BASE_URL ?? env.API_BASE_URL
  return apiFetch<T>(baseUrl, path, { ...init, token })
}
