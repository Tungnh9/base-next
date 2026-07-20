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
