import { z } from "zod"
import {
  CUSTOMER_CLASSIFICATIONS,
  CUSTOMER_COUNTRIES,
  CUSTOMER_INDUSTRIES,
  CUSTOMER_STATUSES,
  VIETNAM_PROVINCES,
} from "./constants"

// react-hook-form hands back "" for an untouched text input, never undefined.
// These helpers accept "" as "not provided" instead of running the format
// check on it — no z.preprocess(), since preprocess widens the schema's INPUT
// type to unknown and that fights zodResolver + useForm<FormValues>.
const optionalText = (max = 200) => z.string().trim().max(max).optional()

const optionalEmail = () =>
  z.union([z.literal(""), z.string().trim().email("Email không hợp lệ")]).optional()

// Deliberately looser than a strict URL check: users type "example.com"
// without a scheme far more often than a full URL, and rejecting that is
// worse than accepting a slightly malformed host.
const optionalWebsite = () =>
  z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .max(200)
        .regex(/^((https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#][^\s]*)?)$/i, "Website không hợp lệ"),
    ])
    .optional()

const optionalMobile = () =>
  z
    .union([z.literal(""), z.string().trim().min(8, "Số điện thoại không hợp lệ").max(20)])
    .optional()

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  company: z.string().min(1, "Vui lòng nhập tên công ty"),
  classification: z.enum(CUSTOMER_CLASSIFICATIONS),
  industry: z.enum(CUSTOMER_INDUSTRIES),
  status: z.enum(CUSTOMER_STATUSES),

  // Thông tin chung
  shortName: optionalText(100),
  taxCode: optionalText(20),
  website: optionalWebsite(),
  address: optionalText(300),
  country: z.enum(CUSTOMER_COUNTRIES).optional(),
  province: z.enum(VIETNAM_PROVINCES).optional(),

  // Người phụ trách (Employee.id) — existence not verified here, the action
  // layer would need an extra fetch to check it and a dangling id just
  // renders as "Nhân viên #id" in the UI.
  salesRepId: z.string().min(1).max(50).optional(),
  contractManagerId: z.string().min(1).max(50).optional(),

  // Người đại diện
  representativeName: optionalText(100),
  representativePosition: optionalText(100),
  representativeMobile: optionalMobile(),
  representativeEmail: optionalEmail(),

  // Người liên hệ
  contactName: optionalText(100),
  contactPosition: optionalText(100),
  contactMobile: optionalMobile(),
  contactEmail: optionalEmail(),

  // Người phụ trách truyền thông
  mediaContactName: optionalText(100),
  mediaContactPosition: optionalText(100),
  mediaContactMobile: optionalMobile(),
  mediaContactEmail: optionalEmail(),

  // Ảnh & ghi chú — mocked upload: filename only, no bytes cross the wire.
  avatarFileName: optionalText(255),
  notes: optionalText(2000),
  review: optionalText(2000),
})

export const updateCustomerSchema = createCustomerSchema.partial()

// getCustomers()/getCustomerById() are Server Actions — directly callable
// regardless of which UI called them — so their params need the same
// validation as any other external input, not just what the UI happens to send.
export const getCustomersParamsSchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  search: z.string().max(200).optional(),
  classification: z.enum(CUSTOMER_CLASSIFICATIONS).optional(),
  industry: z.enum(CUSTOMER_INDUSTRIES).optional(),
  status: z.enum(CUSTOMER_STATUSES).optional(),
})

export const customerIdSchema = z.string().min(1)

export type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>
export type UpdateCustomerFormValues = z.infer<typeof updateCustomerSchema>
