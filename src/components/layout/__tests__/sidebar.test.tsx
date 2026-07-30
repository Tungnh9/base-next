import { render, screen, within } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("next/navigation", () => ({
  usePathname: () => "/vi/dashboard",
  useParams: () => ({ locale: "vi" }),
}))

vi.mock("@/stores", () => ({
  useUiStore: () => ({
    sidebarCollapsed: false,
    sidebarOpen: false,
    toggleSidebarCollapsed: vi.fn(),
    toggleSidebar: vi.fn(),
    setSidebarOpen: vi.fn(),
  }),
}))

import { Sidebar } from "../sidebar"

describe("Sidebar", () => {
  // Regression guard: the (protected) layout shell is a fixed h-dvh/
  // overflow-hidden container with its own scrolling content pane, so the
  // sidebar never scrolls and should stay a plain in-flow h-full column at
  // desktop widths — only the mobile drawer (max-lg:) needs `fixed`.
  it("is h-full with fixed positioning scoped to max-lg: only, no unscoped sticky/fixed", () => {
    render(<Sidebar />)

    const aside = screen.getByRole("complementary")
    const className = aside.className

    expect(className).toContain("h-full")
    expect(className).toContain("max-lg:fixed")
    expect(className).toContain("max-lg:inset-y-0")
    expect(className).toContain("max-lg:left-0")
    expect(className).not.toMatch(/(^|\s)sticky(\s|$)/)
    expect(className).not.toMatch(/(^|\s)fixed(\s|$)/)
  })

  it("renders a disabled nav item without a navigable link, showing the coming-soon indicator", () => {
    render(<Sidebar />)

    const label = screen.getByText("nav.inputRecords")
    const row = label.closest("div")
    expect(row).not.toBeNull()
    expect(row).toHaveAttribute("aria-disabled", "true")

    expect(screen.queryByRole("link", { name: /nav.inputRecords/i })).not.toBeInTheDocument()
    expect(within(row!).getByText("nav.comingSoonBadge")).toBeInTheDocument()
  })

  it("still renders an enabled item (Dashboard) as a real clickable Link", () => {
    render(<Sidebar />)

    const link = screen.getByRole("link", { name: /nav.dashboard/i })
    expect(link).toHaveAttribute("href", "/vi/dashboard")
  })
})
