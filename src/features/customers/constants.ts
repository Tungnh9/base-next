// Single source of truth for every Customer union type. types.ts derives the
// unions from these; schemas.ts feeds them straight into z.enum(); the filter
// bar and the form map over them. Display labels for every value here live in
// next-intl (messages/*.json), never as hardcoded strings in this file.

export const CUSTOMER_CLASSIFICATIONS = [
  "corporation",
  "large-enterprise",
  "partner",
  "technology",
] as const

export const CUSTOMER_INDUSTRIES = ["finance-banking", "ecommerce", "telecom-it"] as const

export const CUSTOMER_STATUSES = ["collaborating", "paused", "potential"] as const

export const CUSTOMER_COUNTRIES = [
  "vietnam",
  "united-states",
  "japan",
  "south-korea",
  "china",
  "singapore",
  "thailand",
  "malaysia",
  "australia",
  "united-kingdom",
  "germany",
  "other",
] as const

// All 63 Vietnamese provinces / centrally-governed cities (5 municipalities
// first, then the 58 provinces alphabetically). Keys are unaccented kebab-case
// so they're URL/query-string safe and stable if the display label is reworded.
// Display labels live under customers.province.* in messages/*.json.
export const VIETNAM_PROVINCES = [
  "ha-noi",
  "ho-chi-minh",
  "hai-phong",
  "da-nang",
  "can-tho",
  "an-giang",
  "ba-ria-vung-tau",
  "bac-giang",
  "bac-kan",
  "bac-lieu",
  "bac-ninh",
  "ben-tre",
  "binh-dinh",
  "binh-duong",
  "binh-phuoc",
  "binh-thuan",
  "ca-mau",
  "cao-bang",
  "dak-lak",
  "dak-nong",
  "dien-bien",
  "dong-nai",
  "dong-thap",
  "gia-lai",
  "ha-giang",
  "ha-nam",
  "ha-tinh",
  "hai-duong",
  "hau-giang",
  "hoa-binh",
  "hung-yen",
  "khanh-hoa",
  "kien-giang",
  "kon-tum",
  "lai-chau",
  "lam-dong",
  "lang-son",
  "lao-cai",
  "long-an",
  "nam-dinh",
  "nghe-an",
  "ninh-binh",
  "ninh-thuan",
  "phu-tho",
  "phu-yen",
  "quang-binh",
  "quang-nam",
  "quang-ngai",
  "quang-ninh",
  "quang-tri",
  "soc-trang",
  "son-la",
  "tay-ninh",
  "thai-binh",
  "thai-nguyen",
  "thanh-hoa",
  "thua-thien-hue",
  "tien-giang",
  "tra-vinh",
  "tuyen-quang",
  "vinh-long",
  "vinh-phuc",
  "yen-bai",
] as const

// Mã khách hàng convention: {mã phân loại}{mã ngành hàng}-{chữ cái đầu tên
// rút gọn}{5 số theo thứ tự riêng của từng tổ hợp phân loại+ngành hàng+chữ
// cái đầu}. E.g. "2VT-C00001": phân loại "Công ty" (2), ngành "Viễn thông"
// (VT), tên rút gọn bắt đầu bằng "C", khách hàng đầu tiên của tổ hợp này.
//
// The app's own 4-value classification (corporation/large-enterprise/
// partner/technology) doesn't match the convention's 5-value scheme
// (Trực tiếp=1/Công ty=2/Đại lý=3/Trao đổi=4/Khác=5) one-to-one — mapped by
// business decision: every "company-shaped" classification collapses to
// "Công ty" (2); "partner" maps to "Đại lý" (3). Codes 1/4/5 are defined for
// completeness but unreachable from today's classification values.
export const CUSTOMER_CLASSIFICATION_CODES: Record<
  (typeof CUSTOMER_CLASSIFICATIONS)[number],
  string
> = {
  corporation: "2",
  "large-enterprise": "2",
  partner: "3",
  technology: "2",
}

// Ngành hàng viết tắt — Thương mại điện tử dùng nguyên "TMDT" (4 ký tự) thay
// vì rút gọn 2 ký tự như hai ngành còn lại, theo yêu cầu nghiệp vụ.
export const CUSTOMER_INDUSTRY_CODES: Record<(typeof CUSTOMER_INDUSTRIES)[number], string> = {
  "finance-banking": "TC",
  ecommerce: "TMDT",
  "telecom-it": "VT",
}

// Everything the code prefix needs from a customer — deliberately not typed
// against the full Customer/CreateCustomerInput interfaces (which live in
// types.ts and would create a circular import back into this file).
interface CustomerCodePrefixInput {
  classification: (typeof CUSTOMER_CLASSIFICATIONS)[number]
  industry: (typeof CUSTOMER_INDUSTRIES)[number]
  shortName?: string
  company: string
}

// The part of the code before the sequence number — same prefix means same
// per-combination counter. Falls back to the company name's first letter
// when no shortName is set, since shortName is optional but company is not.
export function buildCustomerCodePrefix(input: CustomerCodePrefixInput): string {
  const classificationCode = CUSTOMER_CLASSIFICATION_CODES[input.classification]
  const industryCode = CUSTOMER_INDUSTRY_CODES[input.industry]
  const nameSource = input.shortName?.trim() || input.company
  const initial = nameSource.charAt(0).toUpperCase()
  return `${classificationCode}${industryCode}-${initial}`
}

export function formatCustomerCode(prefix: string, sequence: number): string {
  return `${prefix}${String(sequence).padStart(5, "0")}`
}

// Sentinel for "not selected" in optional Selects — Radix forbids value="".
// Mirrors the "all" sentinel the filter bar already uses.
export const NO_SELECTION = "none"
