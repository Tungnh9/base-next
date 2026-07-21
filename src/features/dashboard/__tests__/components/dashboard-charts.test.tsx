import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import type { DashboardStats } from "../../types"

// echarts-for-react touches the DOM/canvas at import time — mock it out,
// same idea as the dynamic(..., { ssr: false }) it's normally loaded behind.
// DashboardCharts loads it via next/dynamic, so resolution is async — tests
// below use findBy*/waitFor to account for that.
vi.mock("echarts-for-react", () => ({
  default: ({ option }: { option: unknown }) => (
    <div data-testid="echarts-mock">{JSON.stringify(option)}</div>
  ),
}))

import { DashboardCharts } from "../../components/dashboard-charts"

const stats: DashboardStats = {
  totalCustomers: 5,
  totalEmployees: 24,
  customersByStatus: { active: 3, inactive: 2 },
  employeesByStatus: { active: 18, inactive: 4, "on-leave": 2 },
  employeesByDepartment: {
    engineering: 8,
    sales: 4,
    marketing: 3,
    hr: 3,
    finance: 3,
    support: 3,
  },
}

describe("DashboardCharts", () => {
  it("renders a single chart for employees by department", async () => {
    render(<DashboardCharts stats={stats} />)

    const charts = await screen.findAllByTestId("echarts-mock")
    expect(charts).toHaveLength(1)
  })

  it("passes the department counts into the bar chart option", async () => {
    render(<DashboardCharts stats={stats} />)

    const chart = await screen.findByTestId("echarts-mock")

    expect(chart.textContent).toContain("8")
    expect(chart.textContent).toContain("support")
  })

  it("renders the section title", () => {
    render(<DashboardCharts stats={stats} />)

    expect(screen.getByText("totalEmployees")).toBeInTheDocument()
    expect(screen.getByText("byDepartment")).toBeInTheDocument()
  })
})
