"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { addRole, addUser, getUserPermissionsData, removeUser, togglePermission } from "../actions"
import type {
  AddUserInput,
  PermissionAction,
  PermissionModuleKey,
  Role,
  SystemUser,
} from "../types"

export function useUserPermissions() {
  const t = useTranslations("settings.toast")
  const [users, setUsers] = useState<SystemUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getUserPermissionsData().then(({ data, error }) => {
      if (error) {
        toast.error(error.message)
      } else if (data) {
        setUsers(data.users)
        setRoles(data.roles)
      }
      setIsLoading(false)
    })
  }, [])

  const handleAddUser = useCallback(
    async (input: AddUserInput) => {
      const { data, error } = await addUser(input)
      if (error || !data) {
        toast.error(error?.message ?? t("addUserSuccess"))
        return false
      }
      setUsers((prev) => [...prev, data])
      toast.success(t("addUserSuccess"))
      return true
    },
    [t]
  )

  const handleRemoveUser = useCallback(
    async (userId: string) => {
      const { error } = await removeUser(userId)
      if (error) {
        toast.error(error.message)
        return false
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success(t("removeUserSuccess"))
      return true
    },
    [t]
  )

  const handleAddRole = useCallback(async () => {
    const { data, error } = await addRole(t("newRoleDefaultName"))
    if (error || !data) {
      toast.error(error?.message ?? t("addRoleSuccess"))
      return false
    }
    setRoles((prev) => [...prev, data])
    toast.success(t("addRoleSuccess"))
    return true
  }, [t])

  const handleTogglePermission = useCallback(
    async (roleId: string, moduleKey: PermissionModuleKey, action: PermissionAction) => {
      const { data, error } = await togglePermission(roleId, moduleKey, action)
      if (error || !data) {
        toast.error(error?.message ?? "")
        return false
      }
      setRoles((prev) => prev.map((r) => (r.id === roleId ? data : r)))
      return true
    },
    []
  )

  return {
    users,
    roles,
    isLoading,
    addUser: handleAddUser,
    removeUser: handleRemoveUser,
    addRole: handleAddRole,
    togglePermission: handleTogglePermission,
  }
}
