"use client"

import { useUserPermissions } from "../hooks/use-user-permissions"
import { RolePermissionsCard } from "./role-permissions-card"
import { UserListCard } from "./user-list-card"

function UsersPermissionsTab() {
  const { users, roles, addUser, removeUser, addRole, togglePermission } = useUserPermissions()

  return (
    <div className="flex flex-col gap-6">
      <UserListCard users={users} roles={roles} onAddUser={addUser} onRemoveUser={removeUser} />
      <RolePermissionsCard
        roles={roles}
        users={users}
        onAddRole={addRole}
        onTogglePermission={togglePermission}
      />
    </div>
  )
}

export { UsersPermissionsTab }
