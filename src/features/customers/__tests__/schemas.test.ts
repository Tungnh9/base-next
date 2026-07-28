import { describe, it, expect } from "vitest"
import { createCustomerSchema, updateCustomerSchema, getCustomersParamsSchema } from "../schemas"
import { VIETNAM_PROVINCES } from "../constants"

describe("createCustomerSchema", () => {
  const valid = {
    name: "Nguyễn Văn A",
    email: "a@example.com",
    phone: "0901234567",
    company: "ABC Corp",
    classification: "corporation" as const,
    industry: "finance-banking" as const,
    status: "collaborating" as const,
  }

  const fullyPopulated = {
    ...valid,
    shortName: "ABC",
    taxCode: "0123456789",
    website: "example.com",
    address: "123 Lê Lợi",
    country: "vietnam" as const,
    province: "ha-noi" as const,
    salesRepId: "1",
    contractManagerId: "2",
    representativeName: "Trần Thị B",
    representativePosition: "Tổng giám đốc",
    representativeMobile: "0912345678",
    representativeEmail: "rep@example.com",
    contactName: "Lê Văn C",
    contactPosition: "Trưởng phòng",
    contactMobile: "0912345679",
    contactEmail: "contact@example.com",
    mediaContactName: "Phạm Thị D",
    mediaContactPosition: "Chuyên viên Truyền thông",
    mediaContactMobile: "0912345680",
    mediaContactEmail: "media@example.com",
    avatarFileName: "logo.png",
    notes: "Ghi chú nội bộ",
    review: "Hợp tác tốt",
  }

  it("accepts valid input", () => {
    expect(createCustomerSchema.safeParse(valid).success).toBe(true)
  })

  it("accepts a fully-populated 30-field input", () => {
    expect(createCustomerSchema.safeParse(fullyPopulated).success).toBe(true)
  })

  it("accepts empty string for every optional text field", () => {
    const result = createCustomerSchema.safeParse({
      ...valid,
      shortName: "",
      taxCode: "",
      website: "",
      address: "",
      representativeName: "",
      representativeMobile: "",
      representativeEmail: "",
      notes: "",
      review: "",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an invalid representativeEmail but accepts an empty one", () => {
    expect(createCustomerSchema.safeParse({ ...valid, representativeEmail: "bad" }).success).toBe(
      false
    )
    expect(createCustomerSchema.safeParse({ ...valid, representativeEmail: "" }).success).toBe(true)
  })

  it("accepts a website without a scheme but rejects garbage", () => {
    expect(createCustomerSchema.safeParse({ ...valid, website: "example.com" }).success).toBe(true)
    expect(createCustomerSchema.safeParse({ ...valid, website: "not a url" }).success).toBe(false)
  })

  it("rejects an invalid country or province", () => {
    expect(createCustomerSchema.safeParse({ ...valid, country: "mars" }).success).toBe(false)
    expect(createCustomerSchema.safeParse({ ...valid, province: "atlantis" }).success).toBe(false)
  })

  it("accepts every one of the 63 provinces", () => {
    for (const province of VIETNAM_PROVINCES) {
      expect(createCustomerSchema.safeParse({ ...valid, province }).success).toBe(true)
    }
  })

  it("strips an unknown code field rather than rejecting or persisting it", () => {
    const result = createCustomerSchema.safeParse({ ...valid, code: "KH99999" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect("code" in result.data).toBe(false)
    }
  })

  it("rejects short name", () => {
    expect(createCustomerSchema.safeParse({ ...valid, name: "A" }).success).toBe(false)
  })

  it("rejects invalid email", () => {
    expect(createCustomerSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false)
  })

  it("rejects invalid classification", () => {
    expect(createCustomerSchema.safeParse({ ...valid, classification: "unknown" }).success).toBe(
      false
    )
  })

  it("rejects invalid industry", () => {
    expect(createCustomerSchema.safeParse({ ...valid, industry: "unknown" }).success).toBe(false)
  })

  it("rejects invalid status", () => {
    expect(createCustomerSchema.safeParse({ ...valid, status: "unknown" }).success).toBe(false)
  })

  it("rejects empty company", () => {
    expect(createCustomerSchema.safeParse({ ...valid, company: "" }).success).toBe(false)
  })
})

describe("updateCustomerSchema", () => {
  it("allows partial updates", () => {
    expect(updateCustomerSchema.safeParse({ name: "New Name" }).success).toBe(true)
  })

  it("allows empty object", () => {
    expect(updateCustomerSchema.safeParse({}).success).toBe(true)
  })

  it("still validates email format when provided", () => {
    expect(updateCustomerSchema.safeParse({ email: "bad" }).success).toBe(false)
  })

  it("strips an unknown code field rather than rejecting or persisting it", () => {
    const result = updateCustomerSchema.safeParse({ code: "KH99999" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect("code" in result.data).toBe(false)
    }
  })
})

describe("getCustomersParamsSchema", () => {
  it("accepts an empty object (all params optional)", () => {
    expect(getCustomersParamsSchema.safeParse({}).success).toBe(true)
  })

  it("accepts a full set of valid params", () => {
    expect(
      getCustomersParamsSchema.safeParse({
        page: 2,
        pageSize: 20,
        search: "an",
        classification: "partner",
        industry: "ecommerce",
        status: "paused",
      }).success
    ).toBe(true)
  })

  it("rejects a page below 1", () => {
    expect(getCustomersParamsSchema.safeParse({ page: 0 }).success).toBe(false)
  })

  it("rejects a pageSize above 100", () => {
    expect(getCustomersParamsSchema.safeParse({ pageSize: 1000 }).success).toBe(false)
  })

  it("rejects an invalid classification filter", () => {
    expect(getCustomersParamsSchema.safeParse({ classification: "unknown" }).success).toBe(false)
  })

  it("rejects an invalid industry filter", () => {
    expect(getCustomersParamsSchema.safeParse({ industry: "unknown" }).success).toBe(false)
  })

  it("rejects an invalid status filter", () => {
    expect(getCustomersParamsSchema.safeParse({ status: "unknown" }).success).toBe(false)
  })
})
