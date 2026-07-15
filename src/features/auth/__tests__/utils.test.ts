import { describe, it, expect } from "vitest"
import { maskPhone, DEMO_MASKED_PHONE_FALLBACK } from "../utils"

describe("maskPhone", () => {
  it("returns the demo fallback for an empty string", () => {
    expect(maskPhone("")).toBe(DEMO_MASKED_PHONE_FALLBACK)
  })

  it("masks all but the last 4 digits of a normal phone number", () => {
    expect(maskPhone("0901234567")).toBe("⁎⁎⁎⁎⁎⁎4567")
  })

  it("does not mask a 4-character input (nothing left to hide)", () => {
    expect(maskPhone("1234")).toBe("1234")
  })

  it("returns a shorter-than-4-character input unmasked (documents the pass-through quirk)", () => {
    expect(maskPhone("12")).toBe("12")
  })

  it("masks non-numeric characters the same as digits", () => {
    expect(maskPhone("abcdefgh")).toBe("⁎⁎⁎⁎efgh")
  })

  it("masks everything but the last 4 characters of an international format", () => {
    expect(maskPhone("+84901234567")).toBe("⁎⁎⁎⁎⁎⁎⁎⁎4567")
  })
})
