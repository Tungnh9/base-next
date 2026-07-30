import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("@/lib/api", () => ({
  serverApi: vi.fn(),
}))

describe("opportunityApi", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it("delegates to opportunityMockApi (no serverApi call) when USE_MOCK_API is true", async () => {
    vi.doMock("@/lib/mock", async (importOriginal) => ({
      ...(await importOriginal()),
      USE_MOCK_API: true,
    }))
    const { serverApi } = await import("@/lib/api")
    const { opportunityApi } = await import("../api")

    const { error } = await opportunityApi.getAll()

    expect(error).toBeNull()
    expect(serverApi).not.toHaveBeenCalled()
  })

  it("getAll calls serverApi with a bare path when no filters are given", async () => {
    vi.doMock("@/lib/mock", async (importOriginal) => ({
      ...(await importOriginal()),
      USE_MOCK_API: false,
    }))
    const { serverApi } = await import("@/lib/api")
    vi.mocked(serverApi).mockResolvedValue({
      data: { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 },
      error: null,
    })
    const { opportunityApi } = await import("../api")

    await opportunityApi.getAll()

    expect(serverApi).toHaveBeenCalledWith("/sales-opportunities")
  })

  it("getAll builds a query string from every provided filter", async () => {
    vi.doMock("@/lib/mock", async (importOriginal) => ({
      ...(await importOriginal()),
      USE_MOCK_API: false,
    }))
    const { serverApi } = await import("@/lib/api")
    vi.mocked(serverApi).mockResolvedValue({
      data: { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 },
      error: null,
    })
    const { opportunityApi } = await import("../api")

    await opportunityApi.getAll({
      page: 2,
      pageSize: 20,
      search: "deal",
      customerId: "1",
      salesRepId: "2",
      status: "processing",
      createdFrom: "2024-01-01",
      createdTo: "2024-12-31",
    })

    const [calledPath] = vi.mocked(serverApi).mock.calls[0]
    expect(calledPath).toMatch(/^\/sales-opportunities\?/)
    const query = new URLSearchParams(calledPath.split("?")[1])
    expect(query.get("page")).toBe("2")
    expect(query.get("pageSize")).toBe("20")
    expect(query.get("search")).toBe("deal")
    expect(query.get("customerId")).toBe("1")
    expect(query.get("salesRepId")).toBe("2")
    expect(query.get("status")).toBe("processing")
    expect(query.get("createdFrom")).toBe("2024-01-01")
    expect(query.get("createdTo")).toBe("2024-12-31")
  })

  it("delete calls serverApi with DELETE method at the id-scoped path", async () => {
    vi.doMock("@/lib/mock", async (importOriginal) => ({
      ...(await importOriginal()),
      USE_MOCK_API: false,
    }))
    const { serverApi } = await import("@/lib/api")
    vi.mocked(serverApi).mockResolvedValue({ data: undefined, error: null })
    const { opportunityApi } = await import("../api")

    await opportunityApi.delete("42")

    expect(serverApi).toHaveBeenCalledWith("/sales-opportunities/42", { method: "DELETE" })
  })
})
