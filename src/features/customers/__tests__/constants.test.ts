import { describe, it, expect } from "vitest"
import { CUSTOMER_COUNTRIES, VIETNAM_PROVINCES, generateCustomerCode } from "../constants"

describe("generateCustomerCode", () => {
  it("pads the sequence to 5 digits with the KH prefix", () => {
    expect(generateCustomerCode(1)).toBe("KH00001")
    expect(generateCustomerCode(24)).toBe("KH00024")
  })

  it("does not truncate a sequence past 5 digits", () => {
    expect(generateCustomerCode(100_000)).toBe("KH100000")
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
