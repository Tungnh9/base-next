import { describe, it, expect, vi } from "vitest"

// src/test/setup.ts globally mocks "next-intl" (stripping `hasLocale`) so
// components can call useTranslations() without a provider — request.ts needs
// the real `hasLocale`, so restore it here.
vi.unmock("next-intl")

// The real "next-intl/server" only exposes `getRequestConfig` on its
// react-server condition, which isn't set up in this Vitest environment and
// resolves to a stub that throws "not supported in Client Components" — the
// production code only uses it as an identity wrapper (see src/i18n/request.ts),
// so mock that one export directly instead of fighting module resolution.
vi.mock("next-intl/server", () => ({
  getRequestConfig: <T>(fn: T): T => fn,
}))

import getRequestConfig from "../request"
import { routing } from "../routing"

describe("i18n request config", () => {
  it("keeps a supported locale as-is", async () => {
    const config = await getRequestConfig({ requestLocale: Promise.resolve("en") })

    expect(config.locale).toBe("en")
  })

  it("falls back to the default locale for an unsupported locale", async () => {
    const config = await getRequestConfig({ requestLocale: Promise.resolve("fr") })

    expect(config.locale).toBe(routing.defaultLocale)
  })

  it("falls back to the default locale when requestLocale resolves to undefined", async () => {
    const config = await getRequestConfig({ requestLocale: Promise.resolve(undefined) })

    expect(config.locale).toBe(routing.defaultLocale)
  })

  it("sets the explicit Asia/Ho_Chi_Minh timezone", async () => {
    const config = await getRequestConfig({ requestLocale: Promise.resolve("vi") })

    expect(config.timeZone).toBe("Asia/Ho_Chi_Minh")
  })

  it("resolves messages to an object", async () => {
    const config = await getRequestConfig({ requestLocale: Promise.resolve("vi") })

    expect(typeof config.messages).toBe("object")
    expect(config.messages).not.toBeNull()
  })
})
