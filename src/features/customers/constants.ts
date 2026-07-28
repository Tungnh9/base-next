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

export const CUSTOMER_CODE_PREFIX = "KH"

// "KH" + zero-padded sequence, e.g. 1 -> "KH00001", 24 -> "KH00024". A real
// backend owns code allocation — mock-data.ts is the only caller today.
export function generateCustomerCode(sequence: number): string {
  return `${CUSTOMER_CODE_PREFIX}${String(sequence).padStart(5, "0")}`
}

// Sentinel for "not selected" in optional Selects — Radix forbids value="".
// Mirrors the "all" sentinel the filter bar already uses.
export const NO_SELECTION = "none"
