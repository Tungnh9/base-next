import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

// Inline constants from i18n/config — proxy runs in an isolated compilation
// context where tsconfig path aliases (@/) are not reliably resolved by Turbopack.
const locales = ["en", "vi"] as const
type Locale = (typeof locales)[number]
const defaultLocale: Locale = "vi"

// next-intl reads this to resolve the request's locale — must match the
// HEADER_LOCALE_NAME constant baked into next-intl itself. This app uses a
// custom auth proxy instead of next-intl's own middleware, so nothing else
// sets this header (next-intl's per-request `setRequestLocale` cache doesn't
// reliably propagate across separate next-intl calls in this Next.js
// version, so this header is the one resolution path that actually works).
const LOCALE_HEADER = "X-NEXT-INTL-LOCALE"

// Path segments (without locale prefix) that don't require auth
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/forgot-password-verify",
  "/reset-password",
  "/verify-email",
  "/two-step-verification",
  "/maintenance",
  "/coming-soon",
  "/not-authorized",
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
  // Fresh nonce per request — this is what makes nonce-based CSP work at
  // all (a static value would let an attacker who's already gotten one
  // inline script running reuse it for the next). Requires every route to
  // render dynamically; see node_modules/next/dist/docs/01-app/02-guides/
  // content-security-policy.md.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

  // Mirrors the directive list that used to be a static string in
  // next.config.ts's headers() config, with script-src/style-src swapped
  // for their nonce-based equivalents (moved here because next.config.ts
  // can't generate a fresh value per request).
  const isDev = process.env.NODE_ENV !== "production"
  // browserHttpClient (src/lib/api.ts) calls this origin directly from the
  // browser once NEXT_PUBLIC_USE_MOCK_API is off — without it here,
  // connect-src 'self' would silently block every clientApi() call to a
  // real backend on a different origin/port. Read straight from
  // process.env (not @/lib/env) for the same Turbopack-isolation reason as
  // the rest of this file.
  const apiOrigin = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")

  // Every return path below must carry the CSP response header — including
  // the maintenance/login redirects, which previously shipped with none at
  // all (CSP used to live entirely in next.config.ts's headers(), which
  // never applied to proxy.ts's own redirect responses).
  function withCsp(res: NextResponse): NextResponse {
    res.headers.set("Content-Security-Policy", csp)
    return res
  }

  const { pathname } = request.nextUrl

  // Skip static assets and internals
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return withCsp(NextResponse.next())
  }

  const normalizedPath = stripLocale(pathname)
  const locale = extractLocale(pathname)

  // Site-wide maintenance mode — redirect everything except the maintenance page itself
  if (process.env.MAINTENANCE_MODE === "true" && normalizedPath !== "/maintenance") {
    return withCsp(NextResponse.redirect(new URL(`/${locale}/maintenance`, request.url)))
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(LOCALE_HEADER, locale)
  // Forwarded on the request (not just the response) so Next.js can parse
  // the CSP header during SSR and auto-apply the matching nonce to its own
  // framework-injected scripts. x-nonce is the raw value a future Server
  // Component would read via `(await headers()).get("x-nonce")` to pass to
  // a `<Script nonce={...}>`.
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)

  // Public paths — check after stripping locale prefix
  if (PUBLIC_PATHS.some((p) => normalizedPath === p || normalizedPath.startsWith(p + "/"))) {
    return withCsp(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "session"
  const token = request.cookies.get(sessionCookieName)?.value

  if (!token) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return withCsp(NextResponse.redirect(loginUrl))
  }

  const secret = getSecret()
  if (!secret) {
    console.error("JWT_SECRET is not set")
    return withCsp(NextResponse.redirect(new URL(`/${locale}/login`, request.url)))
  }

  try {
    await jwtVerify(token, secret)
    return withCsp(NextResponse.next({ request: { headers: requestHeaders } }))
  } catch {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return withCsp(NextResponse.redirect(loginUrl))
  }
}

export const config = {
  // Exclude: Next.js internals, health check, and a known static-asset
  // extension list only — NOT "any path with a dot in it", which used to let
  // a protected route bypass this auth check entirely just by having a file
  // extension in its path (e.g. /api/export.pdf, /dashboard/report.csv).
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/health)(?!.*\\.(?:png|jpe?g|gif|svg|webp|ico|css|js|woff2?|ttf|eot|map|txt|xml|webmanifest)$).*)",
  ],
}
