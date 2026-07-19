import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../api", () => ({
  employeeApi: {
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
  forbiddenError: vi.fn(() => ({
    message: "Bạn không có quyền thực hiện thao tác này",
    code: "FORBIDDEN",
    status: 403,
  })),
}))

import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../actions"
import { employeeApi } from "../api"
import { requireSession } from "@/lib/auth"

const mockRequireSession = vi.mocked(requireSession)
const mockGetAll = vi.mocked(employeeApi.getAll)
const mockGetById = vi.mocked(employeeApi.getById)
const mockCreate = vi.mocked(employeeApi.create)
const mockUpdate = vi.mocked(employeeApi.update)
const mockDelete = vi.mocked(employeeApi.delete)

const adminSession = { userId: "1", email: "admin@example.com", role: "admin" }
const userSession = { userId: "2", email: "user@example.com", role: "user" }

const validInput = {
  name: "Nguyễn Văn An",
  email: "an@example.com",
  phone: "0901234567",
  department: "engineering" as const,
  position: "Frontend Engineer",
  status: "active" as const,
}

describe("employees actions — auth guard", () => {
  beforeEach(() => vi.clearAllMocks())

  it("getEmployees returns UNAUTHORIZED and never calls employeeApi when there is no session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await getEmployees()

    expect(result).toEqual({
      data: null,
      error: { code: "UNAUTHORIZED", status: 401, message: expect.any(String) },
    })
    expect(mockGetAll).not.toHaveBeenCalled()
  })

  it("getEmployees returns FORBIDDEN for a logged-in non-admin session", async () => {
    mockRequireSession.mockResolvedValue(userSession as never)

    const result = await getEmployees()

    expect(result.error).toEqual({ code: "FORBIDDEN", status: 403, message: expect.any(String) })
    expect(mockGetAll).not.toHaveBeenCalled()
  })

  it("createEmployee returns FORBIDDEN for a non-admin session, even with valid input", async () => {
    mockRequireSession.mockResolvedValue(userSession as never)

    const result = await createEmployee(validInput)

    expect(result.error?.code).toBe("FORBIDDEN")
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("deleteEmployee returns UNAUTHORIZED without a session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await deleteEmployee("1")

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it("getEmployees forwards pagination params and delegates to employeeApi.getAll for an admin session", async () => {
    mockRequireSession.mockResolvedValue(adminSession as never)
    mockGetAll.mockResolvedValue({
      data: { data: [], total: 0, page: 2, pageSize: 10, totalPages: 1 },
      error: null,
    })

    const result = await getEmployees({ page: 2, pageSize: 10, search: "an" })

    expect(mockGetAll).toHaveBeenCalledWith({ page: 2, pageSize: 10, search: "an" })
    expect(result.data?.page).toBe(2)
  })

  it("getEmployeeById delegates to employeeApi.getById for an admin session", async () => {
    mockRequireSession.mockResolvedValue(adminSession as never)
    const employee = { id: "1", ...validInput, joinedAt: "now" }
    mockGetById.mockResolvedValue({ data: employee, error: null })

    const result = await getEmployeeById("1")

    expect(mockGetById).toHaveBeenCalledWith("1")
    expect(result).toEqual({ data: employee, error: null })
  })

  it("createEmployee returns VALIDATION_ERROR for invalid input when the session is admin", async () => {
    mockRequireSession.mockResolvedValue(adminSession as never)

    const result = await createEmployee({ ...validInput, email: "not-an-email" })

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("createEmployee delegates to employeeApi.create with parsed data for an admin session", async () => {
    mockRequireSession.mockResolvedValue(adminSession as never)
    mockCreate.mockResolvedValue({ data: { id: "1", ...validInput, joinedAt: "now" }, error: null })

    const result = await createEmployee(validInput)

    expect(mockCreate).toHaveBeenCalledWith(validInput)
    expect(result.error).toBeNull()
  })

  it("updateEmployee delegates to employeeApi.update with parsed data for an admin session", async () => {
    mockRequireSession.mockResolvedValue(adminSession as never)
    mockUpdate.mockResolvedValue({
      data: { id: "1", ...validInput, joinedAt: "now" },
      error: null,
    })

    const result = await updateEmployee("1", { name: "New Name" })

    expect(mockUpdate).toHaveBeenCalledWith("1", { name: "New Name" })
    expect(result.error).toBeNull()
  })

  it("updateEmployee returns VALIDATION_ERROR for invalid input for an admin session", async () => {
    mockRequireSession.mockResolvedValue(adminSession as never)

    const result = await updateEmployee("1", { email: "not-an-email" } as never)

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("deleteEmployee delegates to employeeApi.delete for an admin session", async () => {
    mockRequireSession.mockResolvedValue(adminSession as never)
    mockDelete.mockResolvedValue({ data: undefined, error: null })

    await deleteEmployee("42")

    expect(mockDelete).toHaveBeenCalledWith("42")
  })
})
