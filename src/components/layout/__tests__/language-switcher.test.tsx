import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"

const push = vi.fn()
const refresh = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => "/vi/dashboard",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn(), refresh }),
}))

import { LanguageSwitcher } from "../language-switcher"

afterEach(() => {
  vi.clearAllMocks()
})

describe("LanguageSwitcher", () => {
  // Regression guard: the active locale is resolved by the root layout from
  // a request header (proxy.ts), an ancestor segment outside the [locale]
  // param — router.push() alone leaves the App Router's Client Cache serving
  // that ancestor's stale render, so switching locale silently did nothing
  // until a full page reload. refresh() busts that cache.
  it("pushes the new locale URL and calls refresh() to bust the stale root-layout cache", () => {
    render(<LanguageSwitcher currentLocale="vi" />)

    fireEvent.click(screen.getByRole("button", { name: "changeLabel" }))
    fireEvent.click(screen.getByText("English"))

    expect(push).toHaveBeenCalledWith("/en/dashboard")
    expect(refresh).toHaveBeenCalledTimes(1)
    // push() must fire before refresh() — an idle-queue refresh() dispatched
    // first would run against the stale URL and get discarded, silently
    // reintroducing the bug this test guards against.
    expect(push.mock.invocationCallOrder[0]).toBeLessThan(refresh.mock.invocationCallOrder[0])
  })

  it("does nothing when selecting the already-active locale", () => {
    render(<LanguageSwitcher currentLocale="vi" />)

    fireEvent.click(screen.getByRole("button", { name: "changeLabel" }))
    fireEvent.click(screen.getByText("Tiếng Việt"))

    expect(push).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })
})
