// Pluggable backing store for src/lib/rate-limit.ts. Two implementations:
//  - InMemoryRateLimitStore: today's Map-based fixed-window limiter, moved
//    here verbatim. Single-instance only — resets on restart, does not
//    synchronize across replicas/serverless invocations.
//  - UpstashRestRateLimitStore: talks to Upstash Redis's REST API directly
//    via fetch(), no SDK dependency. Shared across instances, backed by
//    Redis's native key TTL instead of a manual sweep.
//
// getRateLimitStore() picks between them based on env — callers never
// instantiate a store directly.

import { env } from "@/lib/env"
import { logger } from "./logger"

export interface Bucket {
  count: number
  resetAt: number
}

export interface RateLimitStore {
  get(key: string, now: number): Promise<Bucket | null>
  increment(key: string, windowMs: number, now: number): Promise<Bucket>
  delete(key: string): Promise<void>
}

export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, Bucket>()

  // Opportunistic cleanup so the Map can't grow unbounded from one-off
  // identifiers — bounded by "distinct identifiers active within the last window".
  private sweep(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (now >= bucket.resetAt) this.buckets.delete(key)
    }
  }

  async get(key: string, now: number): Promise<Bucket | null> {
    const bucket = this.buckets.get(key)
    if (!bucket || now >= bucket.resetAt) return null
    return bucket
  }

  async increment(key: string, windowMs: number, now: number): Promise<Bucket> {
    this.sweep(now)
    const bucket = this.buckets.get(key)
    if (!bucket || now >= bucket.resetAt) {
      const fresh: Bucket = { count: 1, resetAt: now + windowMs }
      this.buckets.set(key, fresh)
      return fresh
    }
    bucket.count += 1
    return bucket
  }

  async delete(key: string): Promise<void> {
    this.buckets.delete(key)
  }
}

type RedisCommand = (string | number)[]

// Upstash's REST pipeline endpoint returns one { result, error } per command,
// in the same order they were submitted.
interface UpstashPipelineResultEntry {
  result?: unknown
  error?: string
}

function isUpstashPipelineResult(value: unknown): value is UpstashPipelineResultEntry[] {
  return Array.isArray(value)
}

export class UpstashRestRateLimitStore implements RateLimitStore {
  constructor(
    private readonly url: string,
    private readonly token: string
  ) {}

  private async pipeline(commands: RedisCommand[]): Promise<unknown[]> {
    const res = await fetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    })

    if (!res.ok) {
      throw new Error(`Upstash REST pipeline request failed with status ${res.status}`)
    }

    const body: unknown = await res.json()
    if (!isUpstashPipelineResult(body)) {
      throw new Error("Upstash REST pipeline returned an unexpected response shape")
    }

    // A per-command error still comes back inside a 200 response (e.g.
    // WRONGTYPE) — entry.result would silently be undefined for that
    // command, which Number(undefined) turns into NaN. NaN >= max is always
    // false, so an unchecked error here would make rate limiting fail open
    // instead of erroring. Fail loud instead.
    const failed = body.find((entry) => entry.error)
    if (failed) {
      throw new Error(`Upstash REST pipeline command failed: ${failed.error}`)
    }

    return body.map((entry) => entry.result)
  }

  async get(key: string, now: number): Promise<Bucket | null> {
    const [value, pttl] = await this.pipeline([
      ["GET", key],
      ["PTTL", key],
    ])

    const pttlNum = typeof pttl === "number" ? pttl : Number(pttl)
    if (value === null || value === undefined || !Number.isFinite(pttlNum) || pttlNum <= 0) {
      return null
    }

    return { count: Number(value), resetAt: now + pttlNum }
  }

  async increment(key: string, windowMs: number, now: number): Promise<Bucket> {
    const [count] = await this.pipeline([
      ["INCR", key],
      ["PEXPIRE", key, windowMs, "NX"],
    ])
    const [pttl] = await this.pipeline([["PTTL", key]])

    const pttlNum = typeof pttl === "number" ? pttl : Number(pttl)
    return { count: Number(count), resetAt: now + pttlNum }
  }

  async delete(key: string): Promise<void> {
    await this.pipeline([["DEL", key]])
  }
}

let store: RateLimitStore | undefined
let warnedAboutInMemoryFallback = false

export function getRateLimitStore(): RateLimitStore {
  if (store) return store

  const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = env
  if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
    store = new UpstashRestRateLimitStore(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
    return store
  }

  if (env.NODE_ENV === "production" && !warnedAboutInMemoryFallback) {
    warnedAboutInMemoryFallback = true
    logger.warn(
      "Rate limiting is falling back to an in-memory store in production — set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for a shared store across instances."
    )
  }

  store = new InMemoryRateLimitStore()
  return store
}
