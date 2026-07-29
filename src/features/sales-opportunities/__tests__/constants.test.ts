import { describe, it, expect } from "vitest"
import { OPPORTUNITY_STATUSES, formatContractValue } from "../constants"

describe("OPPORTUNITY_STATUSES", () => {
  it("has exactly the 3 statuses in the required order", () => {
    expect(OPPORTUNITY_STATUSES).toEqual(["processing", "pending-approval", "transferred"])
  })
})

describe("formatContractValue", () => {
  // Intl's currency format joins the amount and symbol with a non-breaking
  // space (U+00A0), not a regular space — verified against the actual
  // installed Intl implementation.
  it("formats a VND amount using vi-VN currency grouping, no decimals", () => {
    expect(formatContractValue(1_500_000_000)).toBe("1.500.000.000 ₫")
  })

  it("formats zero", () => {
    expect(formatContractValue(0)).toBe("0 ₫")
  })
})
