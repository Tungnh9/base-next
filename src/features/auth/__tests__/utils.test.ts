import { describe, it, expect } from "vitest"
import { maskPhone, DEMO_MASKED_PHONE_FALLBACK, formatCountdown } from "../utils"

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

describe("formatCountdown", () => {
  it("formats 0ms as 0:00", () => {
    expect(formatCountdown(0)).toBe("0:00")
  })

  it("rounds up to the next second", () => {
    expect(formatCountdown(65_000)).toBe("1:05")
  })

  it("rounds a sub-second remainder up rather than truncating to 0:00", () => {
    expect(formatCountdown(400)).toBe("0:01")
  })

  it("formats a full 10-minute window", () => {
    expect(formatCountdown(10 * 60 * 1000)).toBe("10:00")
  })

  it("clamps negative durations to 0:00", () => {
    expect(formatCountdown(-1000)).toBe("0:00")
  })
})
