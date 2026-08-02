"use client"

import { useCallback, useState } from "react"

import { MOCK_ROLES, MOCK_USERS } from "../mock-data"
import type { PermissionAction, PermissionModuleKey, Role, SystemUser } from "../types"

let userIdCounter = 0
function nextUserId() {
  userIdCounter += 1
  return `new-user-${userIdCounter}`
}

let roleIdCounter = 0
function nextRoleId() {
  roleIdCounter += 1
  return `new-role-${roleIdCounter}`
}

const EMPTY_MODULE_PERMISSIONS = { view: false, create: false, edit: false, delete: false }

export function useUserPermissions() {
  const [users, setUsers] = useState<SystemUser[]>(MOCK_USERS)
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)

  const addUser = useCallback((input: { name: string; email: string; roleId: string }) => {
    setUsers((prev) => [
      ...prev,
      {
        id: nextUserId(),
        name: input.name,
        email: input.email,
        roleId: input.roleId,
        status: "active",
      },
    ])
  }, [])

  const removeUser = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }, [])

  const addRole = useCallback(() => {
    setRoles((prev) => [
      ...prev,
      {
        id: nextRoleId(),
        name: "Vai trò mới",
        permissions: {
          customers: { ...EMPTY_MODULE_PERMISSIONS },
          employees: { ...EMPTY_MODULE_PERMISSIONS },
          salesOpportunities: { ...EMPTY_MODULE_PERMISSIONS },
          invoices: { ...EMPTY_MODULE_PERMISSIONS },
          settings: { ...EMPTY_MODULE_PERMISSIONS },
        },
      },
    ])
  }, [])

  const togglePermission = useCallback(
    (roleId: string, moduleKey: PermissionModuleKey, action: PermissionAction) => {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === roleId
            ? {
                ...role,
                permissions: {
                  ...role.permissions,
                  [moduleKey]: {
                    ...role.permissions[moduleKey],
                    [action]: !role.permissions[moduleKey][action],
                  },
                },
              }
            : role
        )
      )
    },
    []
  )

  return { users, roles, addUser, removeUser, addRole, togglePermission }
}
