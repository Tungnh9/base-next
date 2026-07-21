import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

// Validate env at build time — throws if required vars are missing.
import "./src/lib/env"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

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
          // Content-Security-Policy is intentionally NOT listed here anymore.
          // A CSP needs a fresh nonce on every request, which a static config
          // value can't provide — it's now built per-request in src/proxy.ts
          // and set on both the request (so Next.js can auto-nonce its own
          // framework-injected scripts during SSR) and the response. Adding
          // a second, static CSP header here would just run alongside
          // proxy.ts's — the browser enforces the intersection of both,
          // which is confusing and risks someone "fixing" a CSP issue by
          // reintroducing 'unsafe-inline' here without it doing anything.
          //
          // If a future <Script> needs the nonce, read it in a Server
          // Component via `(await headers()).get("x-nonce")` from
          // `next/headers` — proxy.ts forwards it on the request headers —
          // and pass it as that component's `nonce` prop.
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
