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

const optionalEmail = (message?: string) =>
  z.union([z.literal(""), z.string().trim().email(message)]).optional()

// Deliberately looser than a strict URL check: users type "example.com"
// without a scheme far more often than a full URL, and rejecting that is
// worse than accepting a slightly malformed host.
const optionalWebsite = (message?: string) =>
  z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .max(200)
        .regex(/^((https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#][^\s]*)?)$/i, message),
    ])
    .optional()

const optionalMobile = (message?: string) =>
  z.union([z.literal(""), z.string().trim().min(8, message).max(20)]).optional()

// Plain schema — used server-side (actions.ts), where a validation failure
// only needs to be detected, not shown to the end user field-by-field (the
// Server Action always returns the generic, translated VALIDATION_ERROR).
export const createCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  company: z.string().min(1),
  classification: z.enum(CUSTOMER_CLASSIFICATIONS),
  industry: z.enum(CUSTOMER_INDUSTRIES),
  status: z.enum(CUSTOMER_STATUSES),

  shortName: z.string().trim().min(1).max(100),
  taxCode: z.string().trim().min(1).max(20),
  website: optionalWebsite(),
  address: optionalText(300),
  country: z.enum(CUSTOMER_COUNTRIES).optional(),
  province: z.enum(VIETNAM_PROVINCES).optional(),

  // Người phụ trách (Employee.id) — existence not verified here, the action
  // layer would need an extra fetch to check it and a dangling id just
  // renders as "Nhân viên #id" in the UI. Both required per business rule.
  salesRepId: z.string().min(1).max(50),
  contractManagerId: z.string().min(1).max(50),

  representativeName: optionalText(100),
  representativePosition: optionalText(100),
  representativeMobile: optionalMobile(),
  representativeEmail: optionalEmail(),

  contactName: optionalText(100),
  contactPosition: optionalText(100),
  contactMobile: optionalMobile(),
  contactEmail: optionalEmail(),

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

// Translated variant for the client-side form (react-hook-form + zodResolver),
// mirroring the createXSchema(t) pattern already used in features/auth/schemas.ts.
export function createCreateCustomerSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, t("nameMin")),
    email: z.string().email(t("emailInvalid")),
    phone: z.string().min(8, t("phoneInvalid")),
    company: z.string().min(1, t("companyRequired")),
    classification: z.enum(CUSTOMER_CLASSIFICATIONS),
    industry: z.enum(CUSTOMER_INDUSTRIES),
    status: z.enum(CUSTOMER_STATUSES),

    shortName: z.string().trim().min(1, t("shortNameRequired")).max(100),
    taxCode: z.string().trim().min(1, t("taxCodeRequired")).max(20),
    website: optionalWebsite(t("websiteInvalid")),
    address: optionalText(300),
    country: z.enum(CUSTOMER_COUNTRIES).optional(),
    province: z.enum(VIETNAM_PROVINCES).optional(),

    salesRepId: z
      .string({ error: t("salesRepRequired") })
      .min(1, t("salesRepRequired"))
      .max(50),
    contractManagerId: z
      .string({ error: t("contractManagerRequired") })
      .min(1, t("contractManagerRequired"))
      .max(50),

    representativeName: optionalText(100),
    representativePosition: optionalText(100),
    representativeMobile: optionalMobile(t("mobileInvalid")),
    representativeEmail: optionalEmail(t("emailInvalid")),

    contactName: optionalText(100),
    contactPosition: optionalText(100),
    contactMobile: optionalMobile(t("mobileInvalid")),
    contactEmail: optionalEmail(t("emailInvalid")),

    mediaContactName: optionalText(100),
    mediaContactPosition: optionalText(100),
    mediaContactMobile: optionalMobile(t("mobileInvalid")),
    mediaContactEmail: optionalEmail(t("emailInvalid")),

    avatarFileName: optionalText(255),
    notes: optionalText(2000),
    review: optionalText(2000),
  })
}

export function createUpdateCustomerSchema(t: (key: string) => string) {
  return createCreateCustomerSchema(t).partial()
}

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
