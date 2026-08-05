import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../api", () => ({
  settingsApi: {
    getWorkflowConfig: vi.fn(),
    saveWorkflowConfig: vi.fn(),
    getUserPermissionsData: vi.fn(),
    addUser: vi.fn(),
    removeUser: vi.fn(),
    addRole: vi.fn(),
    togglePermission: vi.fn(),
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
  validationError: vi.fn(async () => ({
    message: "Dữ liệu không hợp lệ",
    code: "VALIDATION_ERROR",
    status: 400,
  })),
}))

import {
  getWorkflowConfig,
  saveWorkflowConfig,
  getUserPermissionsData,
  addUser,
  removeUser,
  addRole,
  togglePermission,
} from "../actions"
import { settingsApi } from "../api"
import { requireSession } from "@/lib/auth"

const mockRequireSession = vi.mocked(requireSession)
const mockGetWorkflowConfig = vi.mocked(settingsApi.getWorkflowConfig)
const mockSaveWorkflowConfig = vi.mocked(settingsApi.saveWorkflowConfig)
const mockGetUserPermissionsData = vi.mocked(settingsApi.getUserPermissionsData)
const mockAddUser = vi.mocked(settingsApi.addUser)
const mockRemoveUser = vi.mocked(settingsApi.removeUser)
const mockAddRole = vi.mocked(settingsApi.addRole)
const mockTogglePermission = vi.mocked(settingsApi.togglePermission)

const adminSession = { userId: "1", email: "admin@example.com", role: "admin" }
const userSession = { userId: "2", email: "user@example.com", role: "user" }

const validUserInput = { name: "Nguyễn Văn A", email: "a@example.com", roleId: "role-staff" }

const validStage = {
  id: "stage-1",
  key: "salesOpportunities" as const,
  order: 1,
  enabled: true,
  states: [{ id: "s1", name: "State 1", color: "primary" as const }],
  actions: [{ id: "a1", label: "Action 1", type: "primary" as const, targetStateId: "s1" }],
}

describe("settings actions — auth guard", () => {
  beforeEach(() => vi.clearAllMocks())

  it("getWorkflowConfig returns UNAUTHORIZED and never calls settingsApi without a session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await getWorkflowConfig()

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockGetWorkflowConfig).not.toHaveBeenCalled()
  })

  it("getWorkflowConfig returns FORBIDDEN for a logged-in non-admin session", async () => {
    mockRequireSession.mockResolvedValue(userSession as never)

    const result = await getWorkflowConfig()

    expect(result.error?.code).toBe("FORBIDDEN")
    expect(mockGetWorkflowConfig).not.toHaveBeenCalled()
  })

  it("addUser returns FORBIDDEN for a non-admin session, even with valid input", async () => {
    mockRequireSession.mockResolvedValue(userSession as never)

    const result = await addUser(validUserInput)

    expect(result.error?.code).toBe("FORBIDDEN")
    expect(mockAddUser).not.toHaveBeenCalled()
  })

  it("removeUser returns UNAUTHORIZED without a session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await removeUser("user-1")

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockRemoveUser).not.toHaveBeenCalled()
  })

  it("addRole returns FORBIDDEN for a non-admin session", async () => {
    mockRequireSession.mockResolvedValue(userSession as never)

    const result = await addRole("New role")

    expect(result.error?.code).toBe("FORBIDDEN")
    expect(mockAddRole).not.toHaveBeenCalled()
  })

  it("togglePermission returns FORBIDDEN for a non-admin session", async () => {
    mockRequireSession.mockResolvedValue(userSession as never)

    const result = await togglePermission("role-staff", "customers", "view")

    expect(result.error?.code).toBe("FORBIDDEN")
    expect(mockTogglePermission).not.toHaveBeenCalled()
  })

  it("getUserPermissionsData returns UNAUTHORIZED without a session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await getUserPermissionsData()

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockGetUserPermissionsData).not.toHaveBeenCalled()
  })

  it("saveWorkflowConfig returns UNAUTHORIZED without a session", async () => {
    mockRequireSession.mockResolvedValue(null)

    const result = await saveWorkflowConfig([validStage])

    expect(result.error?.code).toBe("UNAUTHORIZED")
    expect(mockSaveWorkflowConfig).not.toHaveBeenCalled()
  })
})

describe("settings actions — validation for an admin session", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireSession.mockResolvedValue(adminSession as never)
  })

  it("addUser rejects an invalid input and never calls settingsApi.addUser", async () => {
    const result = await addUser({ name: "A", email: "not-an-email", roleId: "" })

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockAddUser).not.toHaveBeenCalled()
  })

  it("addUser delegates to settingsApi.addUser for valid input", async () => {
    mockAddUser.mockResolvedValue({
      data: { id: "user-6", ...validUserInput, status: "active" },
      error: null,
    })

    const result = await addUser(validUserInput)

    expect(mockAddUser).toHaveBeenCalledWith(validUserInput)
    expect(result.data?.id).toBe("user-6")
  })

  it("removeUser rejects an empty id and never calls settingsApi.removeUser", async () => {
    const result = await removeUser("")

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockRemoveUser).not.toHaveBeenCalled()
  })

  it("saveWorkflowConfig rejects a stage with an action targeting a nonexistent state", async () => {
    const badStage = {
      ...validStage,
      actions: [
        { id: "a1", label: "Action 1", type: "primary" as const, targetStateId: "no-such-state" },
      ],
    }

    const result = await saveWorkflowConfig([badStage])

    expect(result.error?.code).toBe("VALIDATION_ERROR")
    expect(mockSaveWorkflowConfig).not.toHaveBeenCalled()
  })

  it("saveWorkflowConfig delegates to settingsApi.saveWorkflowConfig for a valid config", async () => {
    mockSaveWorkflowConfig.mockResolvedValue({ data: [validStage], error: null })

    const result = await saveWorkflowConfig([validStage])

    expect(mockSaveWorkflowConfig).toHaveBeenCalledWith([validStage])
    expect(result.data).toEqual([validStage])
  })

  it("togglePermission rejects toggling the locked Admin role's own permissions", async () => {
    const result = await togglePermission("role-admin", "customers", "view")

    expect(result.error?.code).toBe("FORBIDDEN")
    expect(mockTogglePermission).not.toHaveBeenCalled()
  })

  it("togglePermission delegates to settingsApi.togglePermission for a non-locked role", async () => {
    mockTogglePermission.mockResolvedValue({
      data: {
        id: "role-staff",
        name: "Staff",
        permissions: {
          customers: { view: true, create: false, edit: false, delete: false },
          employees: { view: false, create: false, edit: false, delete: false },
          salesOpportunities: { view: false, create: false, edit: false, delete: false },
          invoices: { view: false, create: false, edit: false, delete: false },
          settings: { view: false, create: false, edit: false, delete: false },
        },
      },
      error: null,
    })

    const result = await togglePermission("role-staff", "customers", "view")

    expect(mockTogglePermission).toHaveBeenCalledWith("role-staff", "customers", "view")
    expect(result.data?.id).toBe("role-staff")
  })

  it("addRole delegates to settingsApi.addRole with the given default name", async () => {
    mockAddRole.mockResolvedValue({
      data: {
        id: "role-4",
        name: "New role",
        permissions: {
          customers: { view: false, create: false, edit: false, delete: false },
          employees: { view: false, create: false, edit: false, delete: false },
          salesOpportunities: { view: false, create: false, edit: false, delete: false },
          invoices: { view: false, create: false, edit: false, delete: false },
          settings: { view: false, create: false, edit: false, delete: false },
        },
      },
      error: null,
    })

    const result = await addRole("New role")

    expect(mockAddRole).toHaveBeenCalledWith("New role")
    expect(result.data?.name).toBe("New role")
  })
})
