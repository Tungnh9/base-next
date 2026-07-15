import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { env } from "@/lib/env"
import { ROUTES } from "@/lib/constants"

export interface SessionPayload extends JWTPayload {
  userId: string
  email: string
  name?: string
  role?: string
  accessToken?: string
}

function getSecret() {
  return new TextEncoder().encode(env.JWT_SECRET)
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

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(env.SESSION_COOKIE_NAME)
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
