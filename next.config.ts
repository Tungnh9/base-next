import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Validate env at build time — throws if required vars are missing. Also
// used below to allow the real backend origin through connect-src.
import { env } from "./src/lib/env"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

// 'unsafe-eval' is only needed for dev-mode HMR/React Refresh — dropped in
// production. 'unsafe-inline' stays for both (Next.js/Tailwind inline
// styles and framework-injected hydration scripts) — removing it safely
// requires per-request nonces threaded through proxy.ts, a bigger change
// out of scope here.
const isDev = process.env.NODE_ENV !== "production"
// browserHttpClient (src/lib/api.ts) calls this origin directly from the
// browser once NEXT_PUBLIC_USE_MOCK_API is off — without it here,
// connect-src 'self' would silently block every clientApi() call to a
// real backend on a different origin/port.
const apiOrigin = env.NEXT_PUBLIC_API_BASE_URL ?? env.API_BASE_URL
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
