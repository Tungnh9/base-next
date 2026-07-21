import { describe, it, expect } from "vitest"
import { routing } from "../routing"
import { locales, defaultLocale } from "../config"

describe("routing config", () => {
  it("exposes the configured locales", () => {
    expect(routing.locales).toEqual(locales)
  })

  it("exposes the configured default locale", () => {
    expect(routing.defaultLocale).toBe(defaultLocale)
  })

  it("always prefixes routes with the locale", () => {
    expect(routing.localePrefix).toBe("always")
  })
})
