import { describe, it, expect } from "vitest"
import { aggregateStats } from "../api"
import type { Customer } from "@/features/customers/types"
import type { Employee } from "@/features/employees/types"

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: "1",
    name: "Test Customer",
    email: "customer@example.com",
    phone: "0900000000",
    company: "Acme",
    status: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  }
}

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: "1",
    name: "Test Employee",
    email: "employee@example.com",
    phone: "0900000000",
    department: "engineering",
    position: "Engineer",
    status: "active",
    joinedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("aggregateStats", () => {
  it("returns all-zero breakdowns for empty input, with every status/department key present", () => {
    const stats = aggregateStats([], [])

    expect(stats.totalCustomers).toBe(0)
    expect(stats.totalEmployees).toBe(0)
    expect(stats.customersByStatus).toEqual({ active: 0, inactive: 0 })
    expect(stats.employeesByStatus).toEqual({ active: 0, inactive: 0, "on-leave": 0 })
    expect(stats.employeesByDepartment).toEqual({
      engineering: 0,
      sales: 0,
      marketing: 0,
      hr: 0,
      finance: 0,
      support: 0,
    })
  })

  it("counts customers by status", () => {
    const customers = [
      makeCustomer({ id: "1", status: "active" }),
      makeCustomer({ id: "2", status: "active" }),
      makeCustomer({ id: "3", status: "inactive" }),
    ]

    const stats = aggregateStats(customers, [])

    expect(stats.totalCustomers).toBe(3)
    expect(stats.customersByStatus).toEqual({ active: 2, inactive: 1 })
  })

  it("counts employees by status and by department independently", () => {
    const employees = [
      makeEmployee({ id: "1", department: "engineering", status: "active" }),
      makeEmployee({ id: "2", department: "engineering", status: "on-leave" }),
      makeEmployee({ id: "3", department: "support", status: "active" }),
      makeEmployee({ id: "4", department: "support", status: "inactive" }),
      makeEmployee({ id: "5", department: "sales", status: "active" }),
    ]

    const stats = aggregateStats([], employees)

    expect(stats.totalEmployees).toBe(5)
    expect(stats.employeesByStatus).toEqual({ active: 3, inactive: 1, "on-leave": 1 })
    expect(stats.employeesByDepartment).toEqual({
      engineering: 2,
      sales: 1,
      marketing: 0,
      hr: 0,
      finance: 0,
      support: 2,
    })
  })

  it("aggregates customers and employees together without cross-contaminating counts", () => {
    const customers = [makeCustomer({ status: "active" }), makeCustomer({ status: "inactive" })]
    const employees = [
      makeEmployee({ department: "finance", status: "inactive" }),
      makeEmployee({ department: "hr", status: "active" }),
    ]

    const stats = aggregateStats(customers, employees)

    expect(stats.totalCustomers).toBe(2)
    expect(stats.totalEmployees).toBe(2)
    expect(stats.customersByStatus).toEqual({ active: 1, inactive: 1 })
    expect(stats.employeesByStatus).toEqual({ active: 1, inactive: 1, "on-leave": 0 })
    expect(stats.employeesByDepartment.finance).toBe(1)
    expect(stats.employeesByDepartment.hr).toBe(1)
    expect(stats.employeesByDepartment.engineering).toBe(0)
  })
})
