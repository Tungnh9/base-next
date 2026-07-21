import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body }
}

describe("UpstashRestRateLimitStore", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("increment() pipelines INCR+PEXPIRE then a follow-up PTTL call to compute resetAt", async () => {
    const { UpstashRestRateLimitStore } = await import("../rate-limit-store")
    const store = new UpstashRestRateLimitStore("https://upstash.example.com", "test-token")

    fetchMock
      .mockResolvedValueOnce(jsonResponse([{ result: 1 }, { result: "OK" }]))
      .mockResolvedValueOnce(jsonResponse([{ result: 60_000 }]))

    const bucket = await store.increment("login:user@example.com", 60_000, 1_000)

    expect(bucket).toEqual({ count: 1, resetAt: 61_000 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://upstash.example.com/pipeline",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
        body: JSON.stringify([
          ["INCR", "login:user@example.com"],
          ["PEXPIRE", "login:user@example.com", 60_000, "NX"],
        ]),
      })
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://upstash.example.com/pipeline",
      expect.objectContaining({
        body: JSON.stringify([["PTTL", "login:user@example.com"]]),
      })
    )
  })

  it("get() returns null when the key is missing", async () => {
    const { UpstashRestRateLimitStore } = await import("../rate-limit-store")
    const store = new UpstashRestRateLimitStore("https://upstash.example.com", "test-token")
    fetchMock.mockResolvedValueOnce(jsonResponse([{ result: null }, { result: -2 }]))

    const bucket = await store.get("missing-key", 1_000)

    expect(bucket).toBeNull()
    expect(fetchMock).toHaveBeenCalledWith(
      "https://upstash.example.com/pipeline",
      expect.objectContaining({
        body: JSON.stringify([
          ["GET", "missing-key"],
          ["PTTL", "missing-key"],
        ]),
      })
    )
  })

  it("get() returns null when pttl is <= 0 even if a value is present", async () => {
    const { UpstashRestRateLimitStore } = await import("../rate-limit-store")
    const store = new UpstashRestRateLimitStore("https://upstash.example.com", "test-token")
    fetchMock.mockResolvedValueOnce(jsonResponse([{ result: "4" }, { result: 0 }]))

    const bucket = await store.get("expiring-now", 1_000)

    expect(bucket).toBeNull()
  })

  it("get() returns the bucket when the key exists with a positive ttl", async () => {
    const { UpstashRestRateLimitStore } = await import("../rate-limit-store")
    const store = new UpstashRestRateLimitStore("https://upstash.example.com", "test-token")
    fetchMock.mockResolvedValueOnce(jsonResponse([{ result: "4" }, { result: 30_000 }]))

    const bucket = await store.get("active-key", 1_000)

    expect(bucket).toEqual({ count: 4, resetAt: 31_000 })
  })

  it("delete() sends a single DEL pipeline command", async () => {
    const { UpstashRestRateLimitStore } = await import("../rate-limit-store")
    const store = new UpstashRestRateLimitStore("https://upstash.example.com", "test-token")
    fetchMock.mockResolvedValueOnce(jsonResponse([{ result: 1 }]))

    await store.delete("some-key")

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://upstash.example.com/pipeline",
      expect.objectContaining({ body: JSON.stringify([["DEL", "some-key"]]) })
    )
  })

  it("throws when the pipeline HTTP request fails", async () => {
    const { UpstashRestRateLimitStore } = await import("../rate-limit-store")
    const store = new UpstashRestRateLimitStore("https://upstash.example.com", "test-token")
    fetchMock.mockResolvedValueOnce(jsonResponse([], false, 500))

    await expect(store.get("some-key", 1_000)).rejects.toThrow()
  })

  it("throws instead of silently coercing to NaN when a pipeline command errors inside a 200 response", async () => {
    // Upstash returns HTTP 200 with a per-command { error } for things like
    // WRONGTYPE — unchecked, entry.result would be undefined here and
    // Number(undefined) === NaN, which would make rate limiting fail open
    // (NaN >= max is always false). This must throw, not return a bucket.
    const { UpstashRestRateLimitStore } = await import("../rate-limit-store")
    const store = new UpstashRestRateLimitStore("https://upstash.example.com", "test-token")
    fetchMock.mockResolvedValueOnce(
      jsonResponse([{ error: "WRONGTYPE Operation against a key holding the wrong kind of value" }])
    )

    await expect(store.delete("bad-key")).rejects.toThrow(/WRONGTYPE/)
  })

  it("throws on a partial pipeline failure (one command ok, one erroring) during increment()", async () => {
    const { UpstashRestRateLimitStore } = await import("../rate-limit-store")
    const store = new UpstashRestRateLimitStore("https://upstash.example.com", "test-token")
    fetchMock.mockResolvedValueOnce(
      jsonResponse([{ result: 1 }, { error: "ERR some pexpire failure" }])
    )

    await expect(store.increment("login:user@example.com", 60_000, 1_000)).rejects.toThrow(
      /ERR some pexpire failure/
    )
  })
})

describe("getRateLimitStore", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.doUnmock("@/lib/env")
    vi.restoreAllMocks()
  })

  it("falls back to InMemoryRateLimitStore when Upstash env vars are unset", async () => {
    vi.doMock("@/lib/env", () => ({
      env: {
        UPSTASH_REDIS_REST_URL: undefined,
        UPSTASH_REDIS_REST_TOKEN: undefined,
        NODE_ENV: "test",
      },
    }))

    const { getRateLimitStore, InMemoryRateLimitStore } = await import("../rate-limit-store")

    expect(getRateLimitStore()).toBeInstanceOf(InMemoryRateLimitStore)
  })

  it("uses UpstashRestRateLimitStore when both Upstash env vars are set", async () => {
    vi.doMock("@/lib/env", () => ({
      env: {
        UPSTASH_REDIS_REST_URL: "https://upstash.example.com",
        UPSTASH_REDIS_REST_TOKEN: "a-token",
        NODE_ENV: "test",
      },
    }))

    const { getRateLimitStore, UpstashRestRateLimitStore } = await import("../rate-limit-store")

    expect(getRateLimitStore()).toBeInstanceOf(UpstashRestRateLimitStore)
  })

  it("falls back to InMemoryRateLimitStore when only one of the two Upstash env vars is set", async () => {
    vi.doMock("@/lib/env", () => ({
      env: {
        UPSTASH_REDIS_REST_URL: "https://upstash.example.com",
        UPSTASH_REDIS_REST_TOKEN: undefined,
        NODE_ENV: "test",
      },
    }))

    const { getRateLimitStore, InMemoryRateLimitStore } = await import("../rate-limit-store")

    expect(getRateLimitStore()).toBeInstanceOf(InMemoryRateLimitStore)
  })

  it("memoizes the store across calls instead of creating a new one each time", async () => {
    vi.doMock("@/lib/env", () => ({
      env: {
        UPSTASH_REDIS_REST_URL: undefined,
        UPSTASH_REDIS_REST_TOKEN: undefined,
        NODE_ENV: "test",
      },
    }))

    const { getRateLimitStore } = await import("../rate-limit-store")

    expect(getRateLimitStore()).toBe(getRateLimitStore())
  })

  it("warns exactly once in production when falling back to the in-memory store", async () => {
    vi.doMock("@/lib/env", () => ({
      env: {
        UPSTASH_REDIS_REST_URL: undefined,
        UPSTASH_REDIS_REST_TOKEN: undefined,
        NODE_ENV: "production",
      },
    }))
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    const { getRateLimitStore } = await import("../rate-limit-store")
    getRateLimitStore()
    getRateLimitStore()
    getRateLimitStore()

    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it("does not warn outside production when falling back to the in-memory store", async () => {
    vi.doMock("@/lib/env", () => ({
      env: {
        UPSTASH_REDIS_REST_URL: undefined,
        UPSTASH_REDIS_REST_TOKEN: undefined,
        NODE_ENV: "development",
      },
    }))
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    const { getRateLimitStore } = await import("../rate-limit-store")
    getRateLimitStore()

    expect(warnSpy).not.toHaveBeenCalled()
  })
})
