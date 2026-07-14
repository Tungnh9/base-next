import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Inline constants from i18n/config — proxy runs in an isolated compilation
// context where tsconfig path aliases (@/) are not reliably resolved by Turbopack.
const locales = ["en", "vi"] as const
type Locale = (typeof locales)[number]
const defaultLocale: Locale = "vi"

// Path segments (without locale prefix) that don't require auth
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/forgot-password-verify",
  "/reset-password",
  "/verify-email",
  "/two-step-verification",
  "/api/health",
]
// URL prefixes to skip entirely (static assets)
const SKIP_PREFIXES = ["/_next", "/favicon.ico"]

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) return null
  return new TextEncoder().encode(secret)
}

// "/vi/login" → "/login", "/vi" → "/"
function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/"
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1)
  }
  return pathname
}

// Extract locale from pathname, fall back to defaultLocale
function extractLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) return locale
  }
  return defaultLocale
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets and internals
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Public paths — check after stripping locale prefix
  const normalizedPath = stripLocale(pathname)
  if (PUBLIC_PATHS.some((p) => normalizedPath === p || normalizedPath.startsWith(p + "/"))) {
    return NextResponse.next()
  }

  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "session"
  const token = request.cookies.get(sessionCookieName)?.value
  const locale = extractLocale(pathname)

  if (!token) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const secret = getSecret()
  if (!secret) {
    console.error("JWT_SECRET is not set")
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  // Exclude: Next.js internals, static files with extensions (.svg, .png, .ico, etc.)
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/health)(?!.*\\.[^/]*$).*)"],
}
