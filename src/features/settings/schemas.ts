import { z } from "zod"

import { COLOR_VARIANTS } from "@/components/ui/color-variants"

// ─── Users & roles ──────────────────────────────────────────────────────────

// Plain schema — used server-side (actions.ts) where a translated message
// never reaches the end user (the Server Action only needs to reject bad
// input, not render field-level errors).
export const addUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  roleId: z.string().min(1),
})

// Translated variant for the client-side form (react-hook-form + zodResolver),
// mirroring the createXSchema(t) pattern already used in features/auth/schemas.ts.
export function createAddUserSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().trim().min(2, t("nameMin")),
    email: z.string().trim().email(t("emailInvalid")),
    roleId: z.string().min(1, t("roleRequired")),
  })
}

export const userIdSchema = z.string().min(1)
export const roleIdSchema = z.string().min(1)

export const permissionModuleKeySchema = z.enum([
  "customers",
  "employees",
  "salesOpportunities",
  "invoices",
  "settings",
])
export const permissionActionSchema = z.enum(["view", "create", "edit", "delete"])

export const togglePermissionSchema = z.object({
  roleId: roleIdSchema,
  moduleKey: permissionModuleKeySchema,
  action: permissionActionSchema,
})

// ─── Workflow config ────────────────────────────────────────────────────────

const workflowStageKeySchema = z.enum([
  "salesOpportunities",
  "inputRecords",
  "bookingDeployment",
  "revenue",
  "acceptanceLiquidation",
  "paymentCollection",
  "invoices",
])

const colorVariantSchema = z.enum(COLOR_VARIANTS as [string, ...string[]])
const actionNodeTypeSchema = z.enum(["primary", "secondary", "success", "danger"])

const stageStateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  color: colorVariantSchema,
})

const actionNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1),
  type: actionNodeTypeSchema,
  targetStateId: z.string(),
})

const workflowStageSchema = z.object({
  id: z.string().min(1),
  key: workflowStageKeySchema,
  order: z.number().int(),
  enabled: z.boolean(),
  states: z.array(stageStateSchema).min(1),
  actions: z.array(actionNodeSchema).min(1),
})

// Every ActionNode.targetStateId must reference a StageState that actually
// exists within the SAME stage — otherwise a saved config could reintroduce
// the dangling-reference bug this schema is partly here to prevent.
export const workflowStagesSchema = z.array(workflowStageSchema).superRefine((stages, ctx) => {
  stages.forEach((stage, stageIndex) => {
    const stateIds = new Set(stage.states.map((s) => s.id))
    stage.actions.forEach((action, actionIndex) => {
      if (!stateIds.has(action.targetStateId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `targetStateId "${action.targetStateId}" does not exist in stage "${stage.id}"`,
          path: [stageIndex, "actions", actionIndex, "targetStateId"],
        })
      }
    })
  })
})
