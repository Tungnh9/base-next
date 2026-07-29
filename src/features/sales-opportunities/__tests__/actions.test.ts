import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../api", () => ({
  opportunityApi: {
    getAll: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("@/lib/auth", () => ({
  requireSession: vi.fn(),
  unauthorizedError: vi.fn(() => ({
    message: "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập",
    code: "UNAUTHORIZED",
    status: 401,
  })),
}))

import { getOpportunities, deleteOpportunity } from "../actions"
import { opportunityApi } from "../api"
import { requireSession } from "@/lib/auth"

const mockRequireSession = vi.mocked(requireSession)
const mockGetAll = vi.mocked(opportunityApi.getAll)
const mockDelete = vi.mocked(opportunityApi.delete)

const mockSession = { userId: "1", email: "user@example.com", role: "user" }

const paginatedEmpty = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 }

describe("sales-opportunities actions — auth guard", () => {
  beforeEach(() => vi.clearAllMocks())

  it("getOpportunities returns UNAUTHORIZED and never calls opportunityApi when there is no session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await getOpportunities()

    expect(result).toEqual({
      data: null,
      error: { code: "UNAUTHORIZED", status: 401, message: expect.any(String) },
    })
    expect(mockGetAll).not.toHaveBeenCalled()
  })

  it("deleteOpportunity returns UNAUTHORIZED without a session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await deleteOpportunity("1")

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it("getOpportunities delegates to opportunityApi.getAll with parsed params when a session exists", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)
    mockGetAll.mockResolvedValue({ data: paginatedEmpty, error: null })

    const result = await getOpportunities({ page: 2, pageSize: 10, search: "deal" })

    expect(mockGetAll).toHaveBeenCalledWith({ page: 2, pageSize: 10, search: "deal" })
    expect(result).toEqual({ data: paginatedEmpty, error: null })
  })

  it("getOpportunities returns VALIDATION_ERROR for an out-of-range pageSize and never calls opportunityApi", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)

    const result = await getOpportunities({ pageSize: 1000 })

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockGetAll).not.toHaveBeenCalled()
  })

  it("getOpportunities returns VALIDATION_ERROR for an invalid status filter", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)

    const result = await getOpportunities({ status: "unknown" as never })

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockGetAll).not.toHaveBeenCalled()
  })

  it("deleteOpportunity delegates to opportunityApi.delete for a valid id when a session exists", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)
    mockDelete.mockResolvedValue({ data: undefined, error: null })

    await deleteOpportunity("42")

    expect(mockDelete).toHaveBeenCalledWith("42")
  })

  it("deleteOpportunity returns VALIDATION_ERROR for an empty id and never calls opportunityApi", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)

    const result = await deleteOpportunity("")

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockDelete).not.toHaveBeenCalled()
  })
})
