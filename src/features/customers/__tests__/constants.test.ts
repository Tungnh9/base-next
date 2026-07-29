import { describe, it, expect } from "vitest"
import {
  CUSTOMER_COUNTRIES,
  VIETNAM_PROVINCES,
  CUSTOMER_CLASSIFICATIONS,
  CUSTOMER_INDUSTRIES,
  CUSTOMER_CLASSIFICATION_CODES,
  CUSTOMER_INDUSTRY_CODES,
  buildCustomerCodePrefix,
  formatCustomerCode,
} from "../constants"

describe("buildCustomerCodePrefix", () => {
  it("matches the documented example: Công ty + Viễn thông + short name starting with C", () => {
    expect(
      buildCustomerCodePrefix({
        classification: "large-enterprise",
        industry: "telecom-it",
        shortName: "CMC",
        company: "Tổng công ty CMC Miền Bắc",
      })
    ).toBe("2VT-C")
  })

  it("maps partner to the Đại lý code (3) with the Tài chính industry code", () => {
    expect(
      buildCustomerCodePrefix({
        classification: "partner",
        industry: "finance-banking",
        shortName: "Techcombank",
        company: "Ngân hàng TMCP Kỹ thương Việt Nam",
      })
    ).toBe("3TC-T")
  })

  it("falls back to the company name's first letter when shortName is absent", () => {
    expect(
      buildCustomerCodePrefix({
        classification: "technology",
        industry: "ecommerce",
        company: "Zenith Software",
      })
    ).toBe("2TMDT-Z")
  })

  it("has a classification code and an industry code for every enum value", () => {
    for (const classification of CUSTOMER_CLASSIFICATIONS) {
      expect(CUSTOMER_CLASSIFICATION_CODES[classification]).toMatch(/^[1-5]$/)
    }
    for (const industry of CUSTOMER_INDUSTRIES) {
      expect(CUSTOMER_INDUSTRY_CODES[industry]).toBeTruthy()
    }
  })
})

describe("formatCustomerCode", () => {
  it("pads the sequence to 5 digits", () => {
    expect(formatCustomerCode("2VT-C", 1)).toBe("2VT-C00001")
    expect(formatCustomerCode("2VT-C", 24)).toBe("2VT-C00024")
  })

  it("does not truncate a sequence past 5 digits", () => {
    expect(formatCustomerCode("2VT-C", 100_000)).toBe("2VT-C100000")
  })
})

describe("VIETNAM_PROVINCES", () => {
  it("has exactly 63 unique provinces", () => {
    expect(VIETNAM_PROVINCES.length).toBe(63)
    expect(new Set(VIETNAM_PROVINCES).size).toBe(63)
  })
})

describe("CUSTOMER_COUNTRIES", () => {
  it("defaults to vietnam first so the form can default country to it", () => {
    expect(CUSTOMER_COUNTRIES[0]).toBe("vietnam")
  })

  it("has no duplicates", () => {
    expect(new Set(CUSTOMER_COUNTRIES).size).toBe(CUSTOMER_COUNTRIES.length)
  })
})
