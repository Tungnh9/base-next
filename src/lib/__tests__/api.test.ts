import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth", () => ({
  getAccessToken: vi.fn(),
}))

import { serverApi, clientApi, serverHttpClient, browserHttpClient } from "../api"
import { getAccessToken } from "@/lib/auth"
import { ApiClientError } from "@/lib/api-client"

const mockGetAccessToken = vi.mocked(getAccessToken)

// serverHttpClient/browserHttpClient are real ApiClient instances constructed
// once at module load — spy on their prototype methods rather than mocking
// the module, so no real HTTP call is ever attempted.
function stubClient(client: typeof serverHttpClient) {
  return {
    get: vi.spyOn(client, "get"),
    post: vi.spyOn(client, "post"),
    put: vi.spyOn(client, "put"),
    patch: vi.spyOn(client, "patch"),
    delete: vi.spyOn(client, "delete"),
  }
}

describe("serverApi", () => {
  const spies = stubClient(serverHttpClient)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("attaches an Authorization header when an access-token cookie exists", async () => {
    mockGetAccessToken.mockResolvedValue("token-abc")
    spies.get.mockResolvedValue({ id: "1" })

    const result = await serverApi<{ id: string }>("/users/1")

    expect(spies.get).toHaveBeenCalledWith("/users/1", {
      headers: { Authorization: "Bearer token-abc" },
    })
    expect(result).toEqual({ data: { id: "1" }, error: null })
  })

  it("omits the Authorization header when there is no access token", async () => {
    mockGetAccessToken.mockResolvedValue(undefined)
    spies.get.mockResolvedValue({ id: "1" })

    await serverApi("/users/1")

    expect(spies.get).toHaveBeenCalledWith("/users/1", { headers: {} })
  })

  it("parses a JSON string body and routes POST to the client", async () => {
    mockGetAccessToken.mockResolvedValue(undefined)
    spies.post.mockResolvedValue({ id: "1" })

    await serverApi("/users", { method: "POST", body: JSON.stringify({ name: "A" }) })

    expect(spies.post).toHaveBeenCalledWith("/users", { name: "A" }, { headers: {} })
  })

  it("passes a non-string body through as-is (e.g. FormData)", async () => {
    mockGetAccessToken.mockResolvedValue(undefined)
    spies.post.mockResolvedValue(undefined)
    const formData = new FormData()

    await serverApi("/upload", { method: "POST", body: formData })

    expect(spies.post).toHaveBeenCalledWith("/upload", formData, { headers: {} })
  })

  it("routes PUT, PATCH and DELETE to the matching client method", async () => {
    mockGetAccessToken.mockResolvedValue(undefined)
    spies.put.mockResolvedValue(undefined)
    spies.patch.mockResolvedValue(undefined)
    spies.delete.mockResolvedValue(undefined)

    await serverApi("/a", { method: "PUT", body: "{}" })
    await serverApi("/b", { method: "PATCH", body: "{}" })
    await serverApi("/c", { method: "DELETE" })

    expect(spies.put).toHaveBeenCalledWith("/a", {}, { headers: {} })
    expect(spies.patch).toHaveBeenCalledWith("/b", {}, { headers: {} })
    expect(spies.delete).toHaveBeenCalledWith("/c", undefined, { headers: {} })
  })

  it("defaults to GET when no method is given", async () => {
    mockGetAccessToken.mockResolvedValue(undefined)
    spies.get.mockResolvedValue({ ok: true })

    await serverApi("/default")

    expect(spies.get).toHaveBeenCalledWith("/default", { headers: {} })
  })

  it("returns the ApiClientError shape on failure", async () => {
    mockGetAccessToken.mockResolvedValue(undefined)
    spies.get.mockRejectedValue(new ApiClientError(404, "Not found", "NOT_FOUND"))

    const result = await serverApi("/missing")

    expect(result).toEqual({
      data: null,
      error: { message: "Not found", code: "NOT_FOUND", status: 404 },
    })
  })

  it("normalizes a non-ApiClientError failure to a generic network error", async () => {
    mockGetAccessToken.mockResolvedValue(undefined)
    spies.get.mockRejectedValue(new Error("boom"))

    const result = await serverApi("/x")

    expect(result).toEqual({
      data: null,
      error: { message: "Network error", code: "NETWORK_ERROR", status: 0 },
    })
  })
})

describe("clientApi", () => {
  const spies = stubClient(browserHttpClient)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("attaches the explicitly passed token", async () => {
    spies.get.mockResolvedValue({ ok: true })

    await clientApi("/me", undefined, "my-token")

    expect(spies.get).toHaveBeenCalledWith("/me", { headers: { Authorization: "Bearer my-token" } })
  })

  it("works without a token and returns the unwrapped data", async () => {
    spies.get.mockResolvedValue({ ok: true })

    const result = await clientApi("/public")

    expect(spies.get).toHaveBeenCalledWith("/public", { headers: {} })
    expect(result).toEqual({ data: { ok: true }, error: null })
  })

  it("never reads the session cookie — token must come from the caller", async () => {
    spies.get.mockResolvedValue({ ok: true })

    await clientApi("/public")

    expect(mockGetAccessToken).not.toHaveBeenCalled()
  })
})
