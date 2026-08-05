import { renderHook, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import
vi.mock("../../actions", () => ({
  getUserPermissionsData: vi.fn(),
  addUser: vi.fn(),
  removeUser: vi.fn(),
  addRole: vi.fn(),
  togglePermission: vi.fn(),
}))
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { useUserPermissions } from "../use-user-permissions"
import {
  getUserPermissionsData,
  addUser,
  removeUser,
  addRole,
  togglePermission,
} from "../../actions"
import { toast } from "sonner"
import type { Role, SystemUser } from "../../types"

const mockGetData = vi.mocked(getUserPermissionsData)
const mockAddUser = vi.mocked(addUser)
const mockRemoveUser = vi.mocked(removeUser)
const mockAddRole = vi.mocked(addRole)
const mockTogglePermission = vi.mocked(togglePermission)
const mockToastError = vi.mocked(toast.error)
const mockToastSuccess = vi.mocked(toast.success)

const userA: SystemUser = {
  id: "user-1",
  name: "User A",
  email: "a@example.com",
  roleId: "role-staff",
  status: "active",
}

const roleStaff: Role = {
  id: "role-staff",
  name: "Staff",
  permissions: {
    customers: { view: true, create: false, edit: false, delete: false },
    employees: { view: false, create: false, edit: false, delete: false },
    salesOpportunities: { view: false, create: false, edit: false, delete: false },
    invoices: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
}

describe("useUserPermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetData.mockResolvedValue({ data: { users: [userA], roles: [roleStaff] }, error: null })
  })

  it("starts loading then populates users/roles from getUserPermissionsData", async () => {
    const { result } = renderHook(() => useUserPermissions())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.users).toEqual([userA])
    expect(result.current.roles).toEqual([roleStaff])
  })

  it("toasts an error when getUserPermissionsData fails", async () => {
    mockGetData.mockResolvedValue({
      data: null,
      error: { message: "boom", code: "SERVER_ERROR", status: 500 },
    })

    const { result } = renderHook(() => useUserPermissions())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockToastError).toHaveBeenCalledWith("boom")
  })

  it("addUser appends the created user and toasts success", async () => {
    const { result } = renderHook(() => useUserPermissions())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const created: SystemUser = { ...userA, id: "user-2", name: "User B" }
    mockAddUser.mockResolvedValue({ data: created, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.addUser({
        name: "User B",
        email: "b@example.com",
        roleId: "role-staff",
      })
    })

    expect(ok).toBe(true)
    expect(result.current.users).toEqual([userA, created])
    expect(mockToastSuccess).toHaveBeenCalledWith("addUserSuccess")
  })

  it("addUser toasts the server error and does not add a local user on failure", async () => {
    const { result } = renderHook(() => useUserPermissions())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockAddUser.mockResolvedValue({
      data: null,
      error: { message: "Dữ liệu không hợp lệ", code: "VALIDATION_ERROR", status: 400 },
    })

    let ok = true
    await act(async () => {
      ok = await result.current.addUser({ name: "", email: "", roleId: "" })
    })

    expect(ok).toBe(false)
    expect(result.current.users).toEqual([userA])
    expect(mockToastError).toHaveBeenCalledWith("Dữ liệu không hợp lệ")
  })

  it("removeUser filters the user out locally and toasts success", async () => {
    const { result } = renderHook(() => useUserPermissions())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockRemoveUser.mockResolvedValue({ data: undefined, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.removeUser("user-1")
    })

    expect(ok).toBe(true)
    expect(result.current.users).toEqual([])
    expect(mockToastSuccess).toHaveBeenCalledWith("removeUserSuccess")
  })

  it("addRole appends the created role using the translated default name", async () => {
    const { result } = renderHook(() => useUserPermissions())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const newRole: Role = { ...roleStaff, id: "role-new", name: "newRoleDefaultName" }
    mockAddRole.mockResolvedValue({ data: newRole, error: null })

    await act(async () => {
      await result.current.addRole()
    })

    expect(mockAddRole).toHaveBeenCalledWith("newRoleDefaultName")
    expect(result.current.roles).toEqual([roleStaff, newRole])
  })

  it("togglePermission replaces the role with the server's authoritative response", async () => {
    const { result } = renderHook(() => useUserPermissions())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const updatedRole: Role = {
      ...roleStaff,
      permissions: {
        ...roleStaff.permissions,
        customers: { ...roleStaff.permissions.customers, edit: true },
      },
    }
    mockTogglePermission.mockResolvedValue({ data: updatedRole, error: null })

    let ok = false
    await act(async () => {
      ok = await result.current.togglePermission("role-staff", "customers", "edit")
    })

    expect(ok).toBe(true)
    expect(result.current.roles[0].permissions.customers.edit).toBe(true)
  })

  it("togglePermission leaves local roles unchanged on failure (e.g. the locked Admin role)", async () => {
    const { result } = renderHook(() => useUserPermissions())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockTogglePermission.mockResolvedValue({
      data: null,
      error: { message: "forbidden", code: "FORBIDDEN", status: 403 },
    })

    let ok = true
    await act(async () => {
      ok = await result.current.togglePermission("role-admin", "customers", "edit")
    })

    expect(ok).toBe(false)
    expect(result.current.roles).toEqual([roleStaff])
  })
})
