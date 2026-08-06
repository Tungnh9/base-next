import { z } from "zod"

const EMPLOYEE_DEPARTMENTS = [
  "engineering",
  "sales",
  "marketing",
  "hr",
  "finance",
  "support",
] as const
const EMPLOYEE_STATUSES = ["active", "inactive", "on-leave"] as const

// Plain schema — used server-side (actions.ts), where a validation failure
// only needs to be detected, not shown to the end user field-by-field (the
// Server Action always returns the generic, translated VALIDATION_ERROR).
export const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  department: z.enum(EMPLOYEE_DEPARTMENTS),
  position: z.string().min(2),
  status: z.enum(EMPLOYEE_STATUSES),
})

export const updateEmployeeSchema = createEmployeeSchema.partial()

// Translated variant for the client-side form (react-hook-form + zodResolver),
// mirroring the createXSchema(t) pattern already used in features/auth/schemas.ts.
export function createCreateEmployeeSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, t("nameMin")),
    email: z.string().email(t("emailInvalid")),
    phone: z.string().min(8, t("phoneInvalid")),
    department: z.enum(EMPLOYEE_DEPARTMENTS),
    position: z.string().min(2, t("positionRequired")),
    status: z.enum(EMPLOYEE_STATUSES),
  })
}

export function createUpdateEmployeeSchema(t: (key: string) => string) {
  return createCreateEmployeeSchema(t).partial()
}

// getEmployees()/getEmployeeById() are Server Actions — directly callable
// regardless of which UI called them — so their params need the same
// validation as any other external input, not just what the UI happens to send.
export const getEmployeesParamsSchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  search: z.string().max(200).optional(),
})

export const employeeIdSchema = z.string().min(1)

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>
