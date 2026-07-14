import { z } from "zod"

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  company: z.string().min(1, "Vui lòng nhập tên công ty"),
  status: z.enum(["active", "inactive"]),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>
export type UpdateCustomerFormValues = z.infer<typeof updateCustomerSchema>
