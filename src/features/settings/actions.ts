"use server"

import { requireSession, unauthorizedError, forbiddenError, validationError } from "@/lib/auth"
import { settingsApi } from "./api"
import {
  addUserSchema,
  roleIdSchema,
  togglePermissionSchema,
  userIdSchema,
  workflowStagesSchema,
} from "./schemas"
import type { AddUserInput, PermissionAction, PermissionModuleKey, WorkflowStage } from "./types"
import type { ApiError } from "@/types"

// /settings is admin-only (src/config/nav.ts). requireRole() at the page
// level only protects the page shell — a Server Action can be invoked
// directly regardless of which page rendered, so the role check has to be
// repeated here independently, same pattern as features/employees/actions.ts.
async function requireAdmin(): Promise<ApiError | null> {
  const session = await requireSession()
  if (!session) return unauthorizedError()
  if (session.role !== "admin") return forbiddenError()
  return null
}

// The "Admin" role's own permissions are locked in the UI (role-permissions-
// card.tsx, LOCKED_ROLE_ID) so nobody can accidentally lock themselves out —
// re-enforced here since a direct Server Action call bypasses that UI guard.
const LOCKED_ROLE_ID = "role-admin"

export async function getWorkflowConfig() {
  const error = await requireAdmin()
  if (error) return { data: null, error }
  return settingsApi.getWorkflowConfig()
}

export async function saveWorkflowConfig(stages: WorkflowStage[]) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsed = workflowStagesSchema.safeParse(stages)
  if (!parsed.success) return { data: null, error: await validationError() }
  return settingsApi.saveWorkflowConfig(parsed.data as WorkflowStage[])
}

export async function getUserPermissionsData() {
  const error = await requireAdmin()
  if (error) return { data: null, error }
  return settingsApi.getUserPermissionsData()
}

export async function addUser(input: AddUserInput) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsed = addUserSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: await validationError() }
  return settingsApi.addUser(parsed.data)
}

export async function removeUser(userId: string) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsedId = userIdSchema.safeParse(userId)
  if (!parsedId.success) return { data: null, error: await validationError() }
  return settingsApi.removeUser(parsedId.data)
}

export async function addRole(defaultName: string) {
  const error = await requireAdmin()
  if (error) return { data: null, error }
  return settingsApi.addRole(defaultName)
}

export async function togglePermission(
  roleId: string,
  moduleKey: PermissionModuleKey,
  action: PermissionAction
) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsedRoleId = roleIdSchema.safeParse(roleId)
  const parsed = togglePermissionSchema.safeParse({ roleId, moduleKey, action })
  if (!parsedRoleId.success || !parsed.success)
    return { data: null, error: await validationError() }
  if (parsed.data.roleId === LOCKED_ROLE_ID) return { data: null, error: forbiddenError() }

  return settingsApi.togglePermission(parsed.data.roleId, parsed.data.moduleKey, parsed.data.action)
}
