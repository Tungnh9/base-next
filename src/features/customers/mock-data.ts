import { mockApi, mockApiError } from "@/lib/mock"
import {
  CUSTOMER_CLASSIFICATIONS,
  CUSTOMER_INDUSTRIES,
  buildCustomerCodePrefix,
  formatCustomerCode,
} from "./constants"
import type {
  Customer,
  CustomerClassification,
  CustomerCountry,
  CustomerIndustry,
  CustomerStatus,
  VietnamProvince,
  CreateCustomerInput,
  UpdateCustomerInput,
  GetCustomersParams,
} from "./types"
import type { PaginatedResponse } from "@/types"

const FIRST_NAMES = [
  "Nguyễn Văn",
  "Trần Thị",
  "Lê Minh",
  "Phạm Đức",
  "Hoàng Thị",
  "Vũ Quang",
  "Đặng Thu",
  "Bùi Anh",
  "Đỗ Ngọc",
  "Ngô Bảo",
]
const LAST_NAMES = [
  "An",
  "Bình",
  "Châu",
  "Dũng",
  "Lan",
  "Hải",
  "Hương",
  "Khang",
  "Linh",
  "Minh",
  "Nam",
  "Oanh",
]
const COMPANY_NAMES_BY_CLASSIFICATION: Record<(typeof CUSTOMER_CLASSIFICATIONS)[number], string[]> =
  {
    corporation: ["Tập đoàn Sao Việt", "Tập đoàn Hoàng Long", "Tập đoàn Đại Dương"],
    "large-enterprise": ["Công ty CP Thịnh Phát", "Công ty CP Minh Khang", "Công ty CP An Bình"],
    partner: ["Đối tác Toàn Cầu", "Đối tác Phương Nam", "Đối tác Việt Á"],
    technology: ["Startup Tech", "ACME Software", "Globex Technology"],
  }
const SHORT_NAMES_BY_CLASSIFICATION: Record<(typeof CUSTOMER_CLASSIFICATIONS)[number], string> = {
  corporation: "SVG",
  "large-enterprise": "TPC",
  partner: "TCG",
  technology: "ACME",
}
// Weighted so most fixtures land on "collaborating" — closer to a real active customer base.
const STATUS_CYCLE: CustomerStatus[] = [
  "collaborating",
  "collaborating",
  "collaborating",
  "paused",
  "potential",
]
const REPRESENTATIVE_POSITIONS = ["Tổng giám đốc", "Chủ tịch HĐQT", "Phó tổng giám đốc", "Giám đốc"]
const CONTACT_POSITIONS = [
  "Trưởng phòng Mua hàng",
  "Kế toán trưởng",
  "Chuyên viên Kinh doanh",
  "Trợ lý Giám đốc",
]
const MEDIA_POSITIONS = [
  "Trưởng phòng Marketing",
  "Chuyên viên Truyền thông",
  "Giám đốc Thương hiệu",
]
// A representative slice of the 63 provinces — enough to exercise the form's
// province Select without pretending the fixtures cover every province.
const PROVINCE_CYCLE: VietnamProvince[] = [
  "ha-noi",
  "ho-chi-minh",
  "da-nang",
  "hai-phong",
  "can-tho",
  "binh-duong",
  "dong-nai",
  "khanh-hoa",
]
const FOREIGN_COUNTRIES: CustomerCountry[] = ["singapore", "japan", "south-korea"]
// Mock employee ids are "1".."24" (employees/mock-data.ts buildEmployees(24)).
const EMPLOYEE_ID_COUNT = 24

function fullName(i: number, salt: number) {
  return `${FIRST_NAMES[(i + salt) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3 + salt) % LAST_NAMES.length]}`
}
function mobile(i: number, salt: number) {
  return `09${String(30_000_000 + i * 41 + salt * 7)
    .padStart(8, "0")
    .slice(0, 8)}`
}

// Tracks the next sequence number per distinct code prefix (phân loại +
// ngành hàng + chữ cái đầu tên rút gọn) — each combination counts
// independently starting from 1, per the "Mã Khách hàng" convention.
const codeSequenceByPrefix = new Map<string, number>()

function nextCustomerCode(input: {
  classification: CustomerClassification
  industry: CustomerIndustry
  shortName?: string
  company: string
}): string {
  const prefix = buildCustomerCodePrefix(input)
  const sequence = (codeSequenceByPrefix.get(prefix) ?? 0) + 1
  codeSequenceByPrefix.set(prefix, sequence)
  return formatCustomerCode(prefix, sequence)
}

// Deterministic (no Math.random/Date.now) so fixtures and any test asserting
// against them stay stable across runs.
function buildCustomers(count: number): Customer[] {
  return Array.from({ length: count }, (_, i) => {
    const seq = i + 1
    const classification = CUSTOMER_CLASSIFICATIONS[i % CUSTOMER_CLASSIFICATIONS.length]
    const industry = CUSTOMER_INDUSTRIES[i % CUSTOMER_INDUSTRIES.length]
    const companyNames = COMPANY_NAMES_BY_CLASSIFICATION[classification]
    const shortName = `${SHORT_NAMES_BY_CLASSIFICATION[classification]}-${seq}`
    const company = `${companyNames[i % companyNames.length]} ${seq}`

    // Deterministic "sparseness" so the UI's optional-field paths (em-dash
    // placeholders on the detail page, empty Selects in the form) are all
    // exercised by at least one fixture instead of every row being fully filled.
    const isForeign = i % 8 === 7
    const hasMediaContact = i % 4 !== 3
    const hasWebsite = i % 5 !== 0
    const hasTaxCode = i % 6 !== 0
    const hasAvatar = i % 3 === 0
    const hasReview = i % 7 === 0
    const hasContractManager = i % 5 !== 4

    return {
      id: String(seq),
      code: nextCustomerCode({ classification, industry, shortName, company }),
      // Deterministic 0-11 spread — mocks the not-yet-built Sales
      // Opportunities feature's count for this customer.
      opportunityCount: (seq * 5) % 12,
      name: fullName(i, 1),
      shortName,
      email: `customer${seq}@example.com`,
      phone: `09${String(20_000_000 + i * 41)
        .padStart(8, "0")
        .slice(0, 8)}`,
      company,
      classification,
      industry,
      status: STATUS_CYCLE[i % STATUS_CYCLE.length],

      taxCode: hasTaxCode ? String(100_000_000 + seq * 137) : undefined,
      website: hasWebsite ? `https://customer${seq}.example.com` : undefined,
      address: `Số ${seq * 3} đường Lê Lợi, Quận ${(i % 12) + 1}`,
      country: isForeign ? FOREIGN_COUNTRIES[i % FOREIGN_COUNTRIES.length] : "vietnam",
      province: isForeign ? undefined : PROVINCE_CYCLE[i % PROVINCE_CYCLE.length],

      salesRepId: String((i % EMPLOYEE_ID_COUNT) + 1),
      contractManagerId: hasContractManager ? String(((i + 7) % EMPLOYEE_ID_COUNT) + 1) : undefined,

      representativeName: fullName(i, 2),
      representativePosition: REPRESENTATIVE_POSITIONS[i % REPRESENTATIVE_POSITIONS.length],
      representativeMobile: mobile(i, 1),
      representativeEmail: `rep${seq}@example.com`,

      contactName: fullName(i, 4),
      contactPosition: CONTACT_POSITIONS[i % CONTACT_POSITIONS.length],
      contactMobile: mobile(i, 2),
      contactEmail: `contact${seq}@example.com`,

      mediaContactName: hasMediaContact ? fullName(i, 6) : undefined,
      mediaContactPosition: hasMediaContact
        ? MEDIA_POSITIONS[i % MEDIA_POSITIONS.length]
        : undefined,
      mediaContactMobile: hasMediaContact ? mobile(i, 3) : undefined,
      mediaContactEmail: hasMediaContact ? `media${seq}@example.com` : undefined,

      avatarFileName: hasAvatar ? `customer-${seq}-logo.png` : undefined,
      // Never set in mock mode — there is no object storage to produce a URL from.
      avatarUrl: undefined,

      notes: i % 2 === 0 ? `Khách hàng ưu tiên, liên hệ qua ${fullName(i, 4)}.` : undefined,
      review: hasReview ? "Hợp tác tốt, thanh toán đúng hạn." : undefined,

      createdAt: new Date(Date.UTC(2024, i % 12, (i % 27) + 1)).toISOString(),
    }
  })
}

// 24 fixtures — enough to span 3 pages at the UI's default pageSize of 10,
// with a partial last page, so pagination edge cases are visible in the demo.
let customers: Customer[] = buildCustomers(24)
let idCounter = customers.length + 1

export const customerMockApi = {
  getAll: (params: GetCustomersParams = {}) => {
    const { search = "", page = 1, pageSize = 10, classification, industry, status } = params
    const normalizedSearch = search.trim().toLowerCase()

    let filtered = customers
    if (normalizedSearch) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(normalizedSearch) ||
          c.code.toLowerCase().includes(normalizedSearch) ||
          c.email.toLowerCase().includes(normalizedSearch) ||
          c.phone.includes(normalizedSearch)
      )
    }
    if (classification) filtered = filtered.filter((c) => c.classification === classification)
    if (industry) filtered = filtered.filter((c) => c.industry === industry)
    if (status) filtered = filtered.filter((c) => c.status === status)

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * pageSize

    return mockApi<PaginatedResponse<Customer>>({
      data: filtered.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
    })
  },

  getById: (id: string) => {
    const found = customers.find((c) => c.id === id)
    if (!found)
      return mockApiError({ message: "Customer not found", code: "NOT_FOUND", status: 404 })
    return mockApi<Customer>(found)
  },

  create: (input: CreateCustomerInput) => {
    // Backend-owned in production; the mock reuses the id counter for `id`.
    // `code` is unrelated to `id` under this convention — it's derived from
    // classification/industry/shortName/company instead.
    const sequence = idCounter++
    const code = nextCustomerCode({
      classification: input.classification,
      industry: input.industry,
      shortName: input.shortName,
      company: input.company,
    })
    // System-owned fields spread AFTER `...input` — CreateCustomerInput has
    // none of them, but this order guarantees a malformed/direct call still
    // can't smuggle its own id/code/opportunityCount/createdAt through.
    const next: Customer = {
      ...input,
      id: String(sequence),
      code,
      // A new customer starts with zero opportunities — same rationale as
      // `code`, not something the create form can set.
      opportunityCount: 0,
      createdAt: new Date().toISOString(),
    }
    customers = [...customers, next]
    return mockApi<Customer>(next)
  },

  update: (id: string, input: UpdateCustomerInput) => {
    const idx = customers.findIndex((c) => c.id === id)
    if (idx === -1)
      return mockApiError({ message: "Customer not found", code: "NOT_FOUND", status: 404 })
    customers = customers.map((c) => (c.id === id ? { ...c, ...input } : c))
    return mockApi<Customer>(customers[idx])
  },

  delete: (id: string) => {
    customers = customers.filter((c) => c.id !== id)
    return mockApi<void>(undefined)
  },
}
