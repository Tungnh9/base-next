import { serverApi } from "@/lib/api"
import { USE_MOCK_API } from "@/lib/mock"
import { settingsMockApi } from "./mock-data"
import type {
  AddUserInput,
  PermissionAction,
  PermissionModuleKey,
  Role,
  SystemUser,
  WorkflowStage,
} from "./types"

const settingsRealApi = {
  getWorkflowConfig: () => serverApi<WorkflowStage[]>("/settings/workflow-config"),
  saveWorkflowConfig: (stages: WorkflowStage[]) =>
    serverApi<WorkflowStage[]>("/settings/workflow-config", {
      method: "PUT",
      body: JSON.stringify(stages),
    }),
  getUserPermissionsData: () =>
    serverApi<{ users: SystemUser[]; roles: Role[] }>("/settings/users-permissions"),
  addUser: (input: AddUserInput) =>
    serverApi<SystemUser>("/settings/users", { method: "POST", body: JSON.stringify(input) }),
  removeUser: (userId: string) =>
    serverApi<void>(`/settings/users/${userId}`, { method: "DELETE" }),
  addRole: (defaultName: string) =>
    serverApi<Role>("/settings/roles", {
      method: "POST",
      body: JSON.stringify({ name: defaultName }),
    }),
  togglePermission: (roleId: string, moduleKey: PermissionModuleKey, action: PermissionAction) =>
    serverApi<Role>(`/settings/roles/${roleId}/permissions`, {
      method: "PATCH",
      body: JSON.stringify({ moduleKey, action }),
    }),
}

export const settingsApi = USE_MOCK_API ? settingsMockApi : settingsRealApi
