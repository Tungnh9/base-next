import { NextResponse } from "next/server"

// Public liveness check — already exempted from auth in proxy.ts's
// PUBLIC_PATHS and matcher, but the route itself never existed.
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() })
}
