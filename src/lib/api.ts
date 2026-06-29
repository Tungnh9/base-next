import { env } from "@/lib/env";

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string; status: number } };

async function apiFetch<T>(
  baseUrl: string,
  path: string,
  init?: RequestInit & { token?: string }
): Promise<ApiResponse<T>> {
  const { token, ...fetchInit } = init ?? {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchInit.headers as Record<string, string> | undefined),
  };

  try {
    const res = await fetch(`${baseUrl}${path}`, { ...fetchInit, headers });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        data: null,
        error: {
          message: body.message ?? res.statusText,
          code: body.code ?? "UNKNOWN",
          status: res.status,
        },
      };
    }

    const data: T = await res.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Network error",
        code: "NETWORK_ERROR",
        status: 0,
      },
    };
  }
}

// Server-side calls (Server Actions, Route Handlers)
// Tự lấy session cookie — chỉ dùng trong server context
export async function serverApi<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  return apiFetch<T>(env.API_BASE_URL, path, { ...init, token });
}

// Client-side calls (React components)
// Token phải truyền tường minh hoặc đọc từ store
export async function clientApi<T>(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<ApiResponse<T>> {
  const baseUrl = env.NEXT_PUBLIC_API_BASE_URL ?? env.API_BASE_URL;
  return apiFetch<T>(baseUrl, path, { ...init, token });
}
