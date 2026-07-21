import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { StatCard } from "../../components/stat-card"

describe("StatCard", () => {
  it("renders the title and value", () => {
    render(<StatCard title="Total Customers" value={42} />)

    expect(screen.getByText("Total Customers")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("renders an optional description", () => {
    render(<StatCard title="Total Employees" value={24} description="12 active · 12 inactive" />)

    expect(screen.getByText("12 active · 12 inactive")).toBeInTheDocument()
  })

  it("omits the description block when none is provided", () => {
    const { container } = render(<StatCard title="Total Customers" value={5} />)

    const content = container.querySelector('[data-slot="card-content"]')
    expect(content?.children).toHaveLength(1)
  })

  it("accepts ReactNode values, not just primitives", () => {
    render(<StatCard title="Breakdown" value={<span data-testid="rich-value">7</span>} />)

    expect(screen.getByTestId("rich-value")).toBeInTheDocument()
  })
})
