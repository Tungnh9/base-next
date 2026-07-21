import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { StatusBreakdown, type StatusBreakdownItem } from "../../components/status-breakdown"

const items: StatusBreakdownItem[] = [
  { key: "active", label: "Active", count: 3, variant: "success" },
  { key: "inactive", label: "Inactive", count: 1, variant: "secondary" },
]

describe("StatusBreakdown", () => {
  it("renders one segment per item with a non-zero count", () => {
    const { container } = render(<StatusBreakdown items={items} />)

    expect(container.querySelectorAll('[data-slot="progress-segment"]')).toHaveLength(2)
  })

  it("sizes each segment proportionally to its share of the total", () => {
    const { container } = render(<StatusBreakdown items={items} />)

    const segments = container.querySelectorAll('[data-slot="progress-segment"]')
    expect((segments[0] as HTMLElement).style.width).toBe("75%")
    expect((segments[1] as HTMLElement).style.width).toBe("25%")
  })

  it("skips segments for items with a zero count", () => {
    const withZero: StatusBreakdownItem[] = [
      ...items,
      { key: "on-leave", label: "On leave", count: 0, variant: "warning" },
    ]
    const { container } = render(<StatusBreakdown items={withZero} />)

    expect(container.querySelectorAll('[data-slot="progress-segment"]')).toHaveLength(2)
  })

  it("renders a legend entry with the count and label for every item, including zero counts", () => {
    const withZero: StatusBreakdownItem[] = [
      ...items,
      { key: "on-leave", label: "On leave", count: 0, variant: "warning" },
    ]
    render(<StatusBreakdown items={withZero} />)

    expect(screen.getByText(/3 Active/)).toBeInTheDocument()
    expect(screen.getByText(/1 Inactive/)).toBeInTheDocument()
    expect(screen.getByText(/0 On leave/)).toBeInTheDocument()
  })

  it("does not blow up when every count is zero", () => {
    const allZero: StatusBreakdownItem[] = [
      { key: "active", label: "Active", count: 0, variant: "success" },
      { key: "inactive", label: "Inactive", count: 0, variant: "secondary" },
    ]
    const { container } = render(<StatusBreakdown items={allZero} />)

    expect(container.querySelectorAll('[data-slot="progress-segment"]')).toHaveLength(0)
    expect(screen.getByText(/0 Active/)).toBeInTheDocument()
  })
})
