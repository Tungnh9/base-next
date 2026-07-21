// Fixed-window rate limiter. The backing store is pluggable — see
// src/lib/rate-limit-store.ts — defaulting to an in-memory Map (appropriate
// for this template's single-instance/demo stage; resets on server restart
// and does not synchronize across multiple instances/replicas) with an
// optional Upstash Redis REST store for shared, multi-instance deployments.

import { headers } from "next/headers"
import { getRateLimitStore } from "./rate-limit-store"

export interface RateLimitConfig {
  windowMs: number
  max: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now()
  const bucket = await getRateLimitStore().get(key, now)
  if (!bucket) {
    return { allowed: true, remaining: config.max, retryAfterMs: 0 }
  }
  if (bucket.count >= config.max) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now }
  }
  return { allowed: true, remaining: config.max - bucket.count, retryAfterMs: 0 }
}

export async function recordFailedAttempt(key: string, config: RateLimitConfig): Promise<void> {
  const now = Date.now()
  await getRateLimitStore().increment(key, config.windowMs, now)
}

export async function resetRateLimit(key: string): Promise<void> {
  await getRateLimitStore().delete(key)
}

// Best-effort client identifier for actions with no other natural rate-limit
// key (e.g. 2FA code verification, which only receives the OTP itself).
// Trusts x-forwarded-for/x-real-ip as set by the platform's edge proxy —
// fine for throttling abuse, not meant as a strong client identity.
export async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwardedFor = h.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  return h.get("x-real-ip") ?? "unknown"
}
