import type { VariantProps } from "class-variance-authority"

import type { buttonVariants } from "@/components/ui/button"
import type { ColorVariant } from "@/components/ui/color-variants"

export type { ColorVariant }

// ─── Workflow config (tab "Quy trình & thông báo") ─────────────────────────

// Matches the i18n keys already declared under the "nav" namespace
// (nav.sectionSalesProcess in src/config/nav.ts) — stage display names
// resolve through useTranslations("nav")(stage.key), not a separate string.
export type WorkflowStageKey =
  | "salesOpportunities"
  | "inputRecords"
  | "bookingDeployment"
  | "revenue"
  | "acceptanceLiquidation"
  | "paymentCollection"
  | "invoices"

export interface StageState {
  id: string
  name: string
  color: ColorVariant
}

export type ActionNodeType = "primary" | "secondary" | "success" | "danger"

export interface ActionNode {
  id: string
  label: string
  type: ActionNodeType
  targetStateId: string
}

export interface WorkflowStage {
  id: string
  key: WorkflowStageKey
  order: number
  enabled: boolean
  states: StageState[]
  actions: ActionNode[]
}

export interface NotificationSetting {
  id: string
  labelKey: string
  enabled: boolean
}

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>
type ButtonSkin = NonNullable<VariantProps<typeof buttonVariants>["skin"]>

// Fixed mapping from an action node's semantic type to how its preview
// button renders — the "type" dropdown only exposes these 4 values, so the
// button look is derived, not a separate field.
export const ACTION_NODE_TYPE_META: Record<
  ActionNodeType,
  { variant: ButtonVariant; skin: ButtonSkin }
> = {
  primary: { variant: "default", skin: "filled" },
  secondary: { variant: "secondary", skin: "outline" },
  success: { variant: "success", skin: "filled" },
  danger: { variant: "destructive", skin: "outline" },
}

// ─── Users & permissions (tab "Người dùng & phân quyền") ───────────────────

export type SystemUserStatus = "active" | "locked"

export interface SystemUser {
  id: string
  name: string
  email: string
  roleId: string
  status: SystemUserStatus
}

export type PermissionAction = "view" | "create" | "edit" | "delete"

export type PermissionModuleKey =
  "customers" | "employees" | "salesOpportunities" | "invoices" | "settings"

export type RolePermissions = Record<PermissionModuleKey, Record<PermissionAction, boolean>>

export interface Role {
  id: string
  name: string
  permissions: RolePermissions
}

export interface AddUserInput {
  name: string
  email: string
  roleId: string
}
