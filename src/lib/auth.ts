import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { env } from "@/lib/env"
import { ROUTES } from "@/lib/constants"
import type { ApiError } from "@/types"

export interface SessionPayload extends JWTPayload {
  userId: string
  email: string
  name?: string
  role?: string
}

// Separate cookie for the raw backend access token — kept out of the JWT
// payload above. JWT here is signed (JWS), not encrypted: anyone who can
// read the cookie can base64-decode its payload, so a real secret has no
// business living inside it. httpOnly still keeps it out of reach of JS/XSS.
const ACCESS_TOKEN_COOKIE_NAME = "access_token"

function getSecret() {
  return new TextEncoder().encode(env.JWT_SECRET)
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  }
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// Sets the signed session-identity cookie and the access-token cookie
// together, since every caller (login, register, 2FA verify) always
// establishes both at once.
export async function setSession(payload: SessionPayload, accessToken: string): Promise<void> {
  const token = await signToken(payload)
  const cookieStore = await cookies()
  const opts = cookieOptions()
  cookieStore.set(env.SESSION_COOKIE_NAME, token, opts)
  cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, opts)
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(env.SESSION_COOKIE_NAME)
  cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME)
}

// For serverApi() to attach as a Bearer token when calling the real backend —
// deliberately reads the cookie directly rather than going through the JWT
// session, since the access token is no longer part of that payload.
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value
}

// Authorization guard — call from a Server Component/page with the current locale.
// Assumes the (protected) layout already redirected unauthenticated users to /login;
// this only adds the role check on top and redirects to /not-authorized on mismatch.
export async function requireRole(locale: string, allowedRoles: string[]): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    redirect(`/${locale}${ROUTES.login}`)
  }
  if (!session.role || !allowedRoles.includes(session.role)) {
    redirect(`/${locale}${ROUTES.notAuthorized}`)
  }
  return session
}

// Session guard for Server Actions that return an {data, error} ApiResponse to
// a client caller — distinct from requireRole(), which is for pages/layouts
// and redirects. Redirecting mid-mutation would break the {data,error} API
// contract callers rely on (e.g. useCustomers() awaits a resolved value, not
// a thrown redirect).
export async function requireSession(): Promise<SessionPayload | null> {
  return getSession()
}

// Shared 401 payload for the requireSession() failure path, so every Server
// Action using it returns an identical, testable error shape.
export function unauthorizedError(): ApiError {
  return {
    message: "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập",
    code: "UNAUTHORIZED",
    status: 401,
  }
}

// Shared 403 payload — distinct from unauthorizedError()'s 401: this is for
// Server Actions where the caller IS authenticated but lacks the required
// role (requireRole() redirects, which is wrong for actions returning
// {data,error} — same reasoning as requireSession() above).
export function forbiddenError(): ApiError {
  return {
    message: "Bạn không có quyền thực hiện thao tác này",
    code: "FORBIDDEN",
    status: 403,
  }
}

// Shared 400 payload for a failed Zod .safeParse() in a Server Action.
// Async (unlike unauthorizedError()/forbiddenError() above) because it needs
// getTranslations() to resolve the request's locale — every actions.ts file
// used to inline this as a hardcoded Vietnamese literal, which showed up
// untranslated on /en. Centralizing it here also stops every feature from
// re-declaring its own byte-identical VALIDATION_ERROR constant.
export async function validationError(): Promise<ApiError> {
  const t = await getTranslations("common")
  return { message: t("invalidData"), code: "VALIDATION_ERROR", status: 400 }
}
