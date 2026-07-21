import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

// setup.ts globally mocks next-intl with only { useTranslations, useLocale } —
// override it here with a full replacement that also includes
// NextIntlClientProvider (as a spy so we can assert what Providers forwards
// to it), scoped to this test file only.
const nextIntlProviderSpy = vi.fn()
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "vi",
  NextIntlClientProvider: (props: { children: React.ReactNode }) => {
    nextIntlProviderSpy(props)
    return <>{props.children}</>
  },
}))

const themeProviderSpy = vi.fn()
vi.mock("next-themes", () => ({
  ThemeProvider: (props: { children: React.ReactNode }) => {
    themeProviderSpy(props)
    return <>{props.children}</>
  },
}))

// Sonner's real Toaster reads window.matchMedia, unavailable in jsdom — not
// what this file is testing (Providers' prop-forwarding), so stub it out.
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }))

import { Providers } from "../providers"

const messages = { common: { hello: "Hello" } }

describe("Providers", () => {
  beforeEach(() => {
    nextIntlProviderSpy.mockClear()
    themeProviderSpy.mockClear()
  })

  it("renders children through both providers", () => {
    render(
      <Providers locale="vi" messages={messages}>
        <div data-testid="child" />
      </Providers>
    )

    expect(screen.getByTestId("child")).toBeInTheDocument()
  })

  it("forwards locale, messages, and timeZone to NextIntlClientProvider", () => {
    render(
      <Providers locale="en" messages={messages} timeZone="Asia/Ho_Chi_Minh">
        <div />
      </Providers>
    )

    expect(nextIntlProviderSpy).toHaveBeenCalledWith(
      expect.objectContaining({ locale: "en", messages, timeZone: "Asia/Ho_Chi_Minh" })
    )
  })

  // This is the actual security-relevant wiring: next-themes injects its own
  // inline FOUC-prevention <script> (dangerouslySetInnerHTML, outside this
  // src/ tree) that the app's nonce-based CSP (src/proxy.ts) would otherwise
  // block outright. If this forwarding silently breaks, dark mode would
  // flash-of-wrong-theme in production with no obvious error.
  it("forwards a real nonce value to next-themes' ThemeProvider", () => {
    render(
      <Providers locale="vi" messages={messages} nonce="csp-nonce-abc">
        <div />
      </Providers>
    )

    expect(themeProviderSpy).toHaveBeenCalledWith(
      expect.objectContaining({ nonce: "csp-nonce-abc" })
    )
  })

  it("coerces a null nonce to undefined rather than forwarding null", () => {
    render(
      <Providers locale="vi" messages={messages} nonce={null}>
        <div />
      </Providers>
    )

    expect(themeProviderSpy.mock.calls[0][0].nonce).toBeUndefined()
  })

  it("defaults to an undefined nonce when the prop is omitted entirely", () => {
    render(
      <Providers locale="vi" messages={messages}>
        <div />
      </Providers>
    )

    expect(themeProviderSpy.mock.calls[0][0].nonce).toBeUndefined()
  })

  it("configures ThemeProvider with class-based, system-aware theming", () => {
    render(
      <Providers locale="vi" messages={messages}>
        <div />
      </Providers>
    )

    expect(themeProviderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: "class",
        defaultTheme: "system",
        enableSystem: true,
        disableTransitionOnChange: true,
      })
    )
  })
})
