"use client"

import { useTranslations } from "next-intl"
import { Plus } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PermissionAction, PermissionModuleKey, Role, SystemUser } from "../types"

const MODULES: PermissionModuleKey[] = [
  "customers",
  "employees",
  "salesOpportunities",
  "invoices",
  "settings",
]
const ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete"]

// Admin always has full access — locking it in the UI avoids a state where
// the only account with full rights could accidentally strip its own access.
const LOCKED_ROLE_ID = "role-admin"

interface RolePermissionsCardProps {
  roles: Role[]
  users: SystemUser[]
  onAddRole: () => void
  onTogglePermission: (
    roleId: string,
    moduleKey: PermissionModuleKey,
    action: PermissionAction
  ) => void
}

function RolePermissionsCard({
  roles,
  users,
  onAddRole,
  onTogglePermission,
}: RolePermissionsCardProps) {
  const t = useTranslations("settings.roles")

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>{t("cardTitle")}</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={onAddRole}>
          <Plus className="mr-1.5 size-4" />
          {t("addRole")}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="single" collapsible variant="advance" className="rounded-none border-x-0">
          {roles.map((role) => {
            const locked = role.id === LOCKED_ROLE_ID
            const userCount = users.filter((user) => user.roleId === role.id).length

            return (
              <AccordionItem key={role.id} value={role.id}>
                <AccordionTrigger>
                  <span className="flex flex-1 items-center gap-3">
                    <span>{role.name}</span>
                    <Badge variant="secondary" skin="light" size="sm">
                      {t("usersCount", { count: userCount })}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Table density="compact">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("moduleColumn")}</TableHead>
                        {ACTIONS.map((action) => (
                          <TableHead key={action} className="text-center">
                            {t(`permissions.${action}`)}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MODULES.map((moduleKey) => (
                        <TableRow key={moduleKey}>
                          <TableCell className="text-foreground font-medium">
                            {t(`modules.${moduleKey}`)}
                          </TableCell>
                          {ACTIONS.map((action) => (
                            <TableCell key={action} className="text-center">
                              <Checkbox
                                color="primary"
                                checked={role.permissions[moduleKey][action]}
                                disabled={locked}
                                onCheckedChange={() =>
                                  onTogglePermission(role.id, moduleKey, action)
                                }
                                aria-label={`${t(`modules.${moduleKey}`)} - ${t(`permissions.${action}`)}`}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}

export { RolePermissionsCard }
