// @vitest-environment node
//
// jsdom's TextEncoder produces a cross-realm Uint8Array that jose's internal
// instanceof checks reject when signing a JWT below — this file needs the
// real Node globals instead.
import { describe, it, expect, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { SignJWT } from "jose"
import { proxy } from "../proxy"

function makeRequest(pathname: string, cookies?: Record<string, string>) {
  const req = new NextRequest(new URL(`http://localhost${pathname}`))
  for (const [name, value] of Object.entries(cookies ?? {})) {
    req.cookies.set(name, value)
  }
  return req
}

async function signSessionToken() {
  const secret = Buffer.from(process.env.JWT_SECRET ?? "", "utf-8")
  return new SignJWT({ sub: "user-1" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret)
}

describe("proxy — maintenance mode", () => {
  const originalMaintenanceMode = process.env.MAINTENANCE_MODE

  afterEach(() => {
    process.env.MAINTENANCE_MODE = originalMaintenanceMode
  })

  it("redirects any path to /maintenance when MAINTENANCE_MODE=true", async () => {
    process.env.MAINTENANCE_MODE = "true"

    const res = await proxy(makeRequest("/vi/dashboard"))

    expect(res.headers.get("location")).toContain("/vi/maintenance")
  })

  it("does not redirect the maintenance page itself", async () => {
    process.env.MAINTENANCE_MODE = "true"

    const res = await proxy(makeRequest("/vi/maintenance"))

    expect(res.headers.get("location")).toBeNull()
  })

  it("passes through normally when MAINTENANCE_MODE is off", async () => {
    process.env.MAINTENANCE_MODE = "false"

    const res = await proxy(makeRequest("/vi/login"))

    expect(res.headers.get("location")).toBeNull()
  })
})

describe("proxy — locale header", () => {
  // next-intl's own middleware would normally set this; this app uses a
  // custom auth proxy instead, so without this header next-intl silently
  // falls back to the default locale for every request regardless of the
  // URL's [locale] segment.
  it("forwards X-NEXT-INTL-LOCALE matching the URL's locale segment on public paths", async () => {
    const res = await proxy(makeRequest("/en/login"))

    expect(res.headers.get("x-middleware-request-x-next-intl-locale")).toBe("en")
  })

  it("forwards X-NEXT-INTL-LOCALE matching the URL's locale segment on authenticated paths", async () => {
    const token = await signSessionToken()
    const res = await proxy(makeRequest("/en/dashboard", { session: token }))

    expect(res.headers.get("x-middleware-request-x-next-intl-locale")).toBe("en")
  })

  it("defaults to the fallback locale when the URL has no locale segment", async () => {
    const res = await proxy(makeRequest("/login"))

    expect(res.headers.get("x-middleware-request-x-next-intl-locale")).toBe("vi")
  })
})

describe("proxy — nonce-based CSP", () => {
  const originalMaintenanceMode = process.env.MAINTENANCE_MODE

  afterEach(() => {
    process.env.MAINTENANCE_MODE = originalMaintenanceMode
  })

  function extractNonce(csp: string | null): string {
    const match = csp?.match(/'nonce-([^']+)'/)
    if (!match) throw new Error(`no nonce found in CSP: ${csp}`)
    return match[1]
  }

  it("sets a Content-Security-Policy with a nonce on a public-path pass-through", async () => {
    const res = await proxy(makeRequest("/vi/login"))
    const csp = res.headers.get("content-security-policy")

    expect(csp).toContain("script-src 'self' 'nonce-")
    expect(csp).toContain("'strict-dynamic'")
  })

  it("forwards the same nonce on both the request headers and the response CSP", async () => {
    const res = await proxy(makeRequest("/vi/login"))

    const requestNonce = res.headers.get("x-middleware-request-x-nonce")
    const responseCspNonce = extractNonce(res.headers.get("content-security-policy"))

    expect(requestNonce).toBe(responseCspNonce)
  })

  it("also forwards the CSP header itself on the request (for Next.js SSR auto-nonce)", async () => {
    const res = await proxy(makeRequest("/vi/login"))

    expect(res.headers.get("x-middleware-request-content-security-policy")).toContain("nonce-")
  })

  it("sets a CSP header on the maintenance redirect", async () => {
    process.env.MAINTENANCE_MODE = "true"

    const res = await proxy(makeRequest("/vi/dashboard"))

    expect(res.headers.get("location")).toContain("/vi/maintenance")
    expect(res.headers.get("content-security-policy")).toContain("nonce-")
  })

  it("sets a CSP header on the no-token login redirect", async () => {
    const res = await proxy(makeRequest("/vi/dashboard"))

    expect(res.headers.get("location")).toContain("/vi/login")
    expect(res.headers.get("content-security-policy")).toContain("nonce-")
  })

  it("sets a CSP header on the invalid-token login redirect", async () => {
    const res = await proxy(makeRequest("/vi/dashboard", { session: "not-a-valid-jwt" }))

    expect(res.headers.get("location")).toContain("/vi/login")
    expect(res.headers.get("content-security-policy")).toContain("nonce-")
  })

  it("sets a CSP header on the authenticated pass-through", async () => {
    const token = await signSessionToken()
    const res = await proxy(makeRequest("/vi/dashboard", { session: token }))

    expect(res.headers.get("location")).toBeNull()
    expect(res.headers.get("content-security-policy")).toContain("nonce-")
  })

  it("generates a fresh nonce on every call", async () => {
    const resA = await proxy(makeRequest("/vi/login"))
    const resB = await proxy(makeRequest("/vi/login"))

    const nonceA = extractNonce(resA.headers.get("content-security-policy"))
    const nonceB = extractNonce(resB.headers.get("content-security-policy"))

    expect(nonceA).not.toBe(nonceB)
  })

  it("sets a CSP header on the static-asset skip path too", async () => {
    const res = await proxy(makeRequest("/_next/static/chunk.js"))

    expect(res.headers.get("content-security-policy")).toContain("nonce-")
  })
})
