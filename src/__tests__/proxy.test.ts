import { describe, it, expect, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { proxy } from "../proxy"

function makeRequest(pathname: string) {
  return new NextRequest(new URL(`http://localhost${pathname}`))
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
