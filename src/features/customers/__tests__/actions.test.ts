import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../api", () => ({
  customerApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../actions"
import { customerApi } from "../api"
import { requireSession } from "@/lib/auth"

const mockRequireSession = vi.mocked(requireSession)
const mockGetAll = vi.mocked(customerApi.getAll)
const mockGetById = vi.mocked(customerApi.getById)
const mockCreate = vi.mocked(customerApi.create)
const mockUpdate = vi.mocked(customerApi.update)
const mockDelete = vi.mocked(customerApi.delete)

const mockSession = { userId: "1", email: "user@example.com", role: "user" }

const validInput = {
  name: "Nguyễn Văn An",
  email: "an@example.com",
  phone: "0901234567",
  company: "ABC",
  classification: "corporation" as const,
  industry: "finance-banking" as const,
  status: "collaborating" as const,
}

const paginatedEmpty = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 }

describe("customers actions — auth guard", () => {
  beforeEach(() => vi.clearAllMocks())

  it("getCustomers returns UNAUTHORIZED and never calls customerApi when there is no session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await getCustomers()

    expect(result).toEqual({
      data: null,
      error: { code: "UNAUTHORIZED", status: 401, message: expect.any(String) },
    })
    expect(mockGetAll).not.toHaveBeenCalled()
  })

  it("getCustomerById returns UNAUTHORIZED without a session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await getCustomerById("1")

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockGetById).not.toHaveBeenCalled()
  })

  it("createCustomer returns UNAUTHORIZED without a session, even with valid input", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await createCustomer(validInput)

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("createCustomer checks auth before validation — invalid input + no session still returns UNAUTHORIZED", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await createCustomer({ ...validInput, email: "not-an-email" })

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("updateCustomer returns UNAUTHORIZED without a session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await updateCustomer("1", { name: "New Name" })

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("deleteCustomer returns UNAUTHORIZED without a session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await deleteCustomer("1")

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it("getCustomers delegates to customerApi.getAll with parsed params when a session exists", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)
    mockGetAll.mockResolvedValue({ data: paginatedEmpty, error: null })

    const result = await getCustomers({ page: 2, pageSize: 10, search: "an" })

    expect(mockGetAll).toHaveBeenCalledWith({ page: 2, pageSize: 10, search: "an" })
    expect(result).toEqual({ data: paginatedEmpty, error: null })
  })

  it("getCustomers returns VALIDATION_ERROR for an out-of-range page and never calls customerApi", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)

    const result = await getCustomers({ page: 0 })

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockGetAll).not.toHaveBeenCalled()
  })

  it("getCustomerById delegates to customerApi.getById when a session exists", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)
    const customer = { id: "1", ...validInput, createdAt: "now" }
    mockGetById.mockResolvedValue({ data: customer, error: null })

    const result = await getCustomerById("1")

    expect(mockGetById).toHaveBeenCalledWith("1")
    expect(result).toEqual({ data: customer, error: null })
  })

  it("createCustomer still returns VALIDATION_ERROR for invalid input when a session exists", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)

    const result = await createCustomer({ ...validInput, email: "not-an-email" })

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("createCustomer delegates to customerApi.create with parsed data when a session exists and input is valid", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)
    mockCreate.mockResolvedValue({
      data: { id: "1", ...validInput, createdAt: "now" },
      error: null,
    })

    const result = await createCustomer(validInput)

    expect(mockCreate).toHaveBeenCalledWith(validInput)
    expect(result.error).toBeNull()
  })

  it("deleteCustomer delegates to customerApi.delete when a session exists", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)
    mockDelete.mockResolvedValue({ data: undefined, error: null })

    await deleteCustomer("42")

    expect(mockDelete).toHaveBeenCalledWith("42")
  })

  it("updateCustomer delegates to customerApi.update with parsed data when a session exists and input is valid", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)
    mockUpdate.mockResolvedValue({
      data: { id: "1", ...validInput, createdAt: "now" },
      error: null,
    })

    const result = await updateCustomer("1", { name: "New Name" })

    expect(mockUpdate).toHaveBeenCalledWith("1", { name: "New Name" })
    expect(result.error).toBeNull()
  })

  it("updateCustomer returns VALIDATION_ERROR for invalid input when a session exists", async () => {
    mockRequireSession.mockResolvedValue(mockSession as never)

    const result = await updateCustomer("1", { email: "not-an-email" } as never)

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
