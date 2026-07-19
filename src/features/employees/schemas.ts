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

export const createEmployeeSchema = z.object({
  name: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  department: z.enum(EMPLOYEE_DEPARTMENTS),
  position: z.string().min(2, "Vui lòng nhập vị trí công việc"),
  status: z.enum(EMPLOYEE_STATUSES),
})

export const updateEmployeeSchema = createEmployeeSchema.partial()

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
