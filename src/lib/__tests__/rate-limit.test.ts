import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "../rate-limit"

const CONFIG = { windowMs: 60_000, max: 3 }

describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows attempts up to the configured max", () => {
    const key = "allows-up-to-max@example.com"

    expect(checkRateLimit(key, CONFIG).allowed).toBe(true)
    recordFailedAttempt(key, CONFIG)
    expect(checkRateLimit(key, CONFIG).allowed).toBe(true)
    recordFailedAttempt(key, CONFIG)
    expect(checkRateLimit(key, CONFIG).allowed).toBe(true)
    recordFailedAttempt(key, CONFIG)
  })

  it("denies the (max+1)th attempt within the window", () => {
    const key = "denies-over-max@example.com"

    for (let i = 0; i < CONFIG.max; i++) recordFailedAttempt(key, CONFIG)

    const result = checkRateLimit(key, CONFIG)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it("retryAfterMs shrinks as time advances toward the window reset", () => {
    const key = "retry-after-shrinks@example.com"
    for (let i = 0; i < CONFIG.max; i++) recordFailedAttempt(key, CONFIG)

    const first = checkRateLimit(key, CONFIG).retryAfterMs
    vi.advanceTimersByTime(30_000)
    const second = checkRateLimit(key, CONFIG).retryAfterMs

    expect(second).toBeLessThan(first)
  })

  it("re-allows a denied key once the window elapses", () => {
    const key = "reallows-after-window@example.com"
    for (let i = 0; i < CONFIG.max; i++) recordFailedAttempt(key, CONFIG)
    expect(checkRateLimit(key, CONFIG).allowed).toBe(false)

    vi.advanceTimersByTime(CONFIG.windowMs + 1)

    expect(checkRateLimit(key, CONFIG).allowed).toBe(true)
  })

  it("resetRateLimit immediately re-allows a key that was at its limit", () => {
    const key = "reset-reallows@example.com"
    for (let i = 0; i < CONFIG.max; i++) recordFailedAttempt(key, CONFIG)
    expect(checkRateLimit(key, CONFIG).allowed).toBe(false)

    resetRateLimit(key)

    const result = checkRateLimit(key, CONFIG)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(CONFIG.max)
  })

  it("recordFailedAttempt on an unknown key starts a fresh bucket with count 1", () => {
    const key = "fresh-bucket@example.com"
    recordFailedAttempt(key, CONFIG)

    const result = checkRateLimit(key, CONFIG)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(CONFIG.max - 1)
  })

  it("tracks separate keys independently", () => {
    const keyA = "independent-a@example.com"
    const keyB = "independent-b@example.com"
    for (let i = 0; i < CONFIG.max; i++) recordFailedAttempt(keyA, CONFIG)

    expect(checkRateLimit(keyA, CONFIG).allowed).toBe(false)
    expect(checkRateLimit(keyB, CONFIG).allowed).toBe(true)
  })
})
