// In-memory fixed-window rate limiter — no external store, appropriate for
// this template's single-instance/demo stage. Resets on server restart and
// does not synchronize across multiple instances/replicas. When a real
// backend/multi-instance deployment exists, swap the internals for a shared
// store (e.g. Upstash Redis) while keeping these same function signatures.

export interface RateLimitConfig {
  windowMs: number
  max: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Opportunistic cleanup so the Map can't grow unbounded from one-off
// identifiers — bounded by "distinct identifiers active within the last window".
function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key)
  }
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || now >= bucket.resetAt) {
    return { allowed: true, remaining: config.max, retryAfterMs: 0 }
  }
  if (bucket.count >= config.max) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now }
  }
  return { allowed: true, remaining: config.max - bucket.count, retryAfterMs: 0 }
}

export function recordFailedAttempt(key: string, config: RateLimitConfig): void {
  const now = Date.now()
  sweep(now)
  const bucket = buckets.get(key)
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs })
    return
  }
  bucket.count += 1
}

export function resetRateLimit(key: string): void {
  buckets.delete(key)
}
