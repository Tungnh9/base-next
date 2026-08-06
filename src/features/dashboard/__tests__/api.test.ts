import { describe, it, expect, vi } from "vitest"

vi.mock("@/features/customers/api", () => ({ customerApi: { getAll: vi.fn() } }))
vi.mock("@/features/employees/api", () => ({ employeeApi: { getAll: vi.fn() } }))

import { aggregateStats, getDashboardStats } from "../api"
import { customerApi } from "@/features/customers/api"
import { employeeApi } from "@/features/employees/api"
import type { Customer } from "@/features/customers/types"
import type { Employee } from "@/features/employees/types"

const mockCustomersGetAll = vi.mocked(customerApi.getAll)
const mockEmployeesGetAll = vi.mocked(employeeApi.getAll)

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: "1",
    code: "KH00001",
    opportunityCount: 0,
    name: "Test Customer",
    email: "customer@example.com",
    phone: "0900000000",
    company: "Acme",
    classification: "corporation",
    industry: "finance-banking",
    status: "collaborating",
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
    expect(stats.customersByStatus).toEqual({ collaborating: 0, paused: 0, potential: 0 })
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
      makeCustomer({ id: "1", status: "collaborating" }),
      makeCustomer({ id: "2", status: "collaborating" }),
      makeCustomer({ id: "3", status: "paused" }),
      makeCustomer({ id: "4", status: "potential" }),
    ]

    const stats = aggregateStats(customers, [])

    expect(stats.totalCustomers).toBe(4)
    expect(stats.customersByStatus).toEqual({ collaborating: 2, paused: 1, potential: 1 })
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
    const customers = [
      makeCustomer({ status: "collaborating" }),
      makeCustomer({ status: "paused" }),
    ]
    const employees = [
      makeEmployee({ department: "finance", status: "inactive" }),
      makeEmployee({ department: "hr", status: "active" }),
    ]

    const stats = aggregateStats(customers, employees)

    expect(stats.totalCustomers).toBe(2)
    expect(stats.totalEmployees).toBe(2)
    expect(stats.customersByStatus).toEqual({ collaborating: 1, paused: 1, potential: 0 })
    expect(stats.employeesByStatus).toEqual({ active: 1, inactive: 1, "on-leave": 0 })
    expect(stats.employeesByDepartment.finance).toBe(1)
    expect(stats.employeesByDepartment.hr).toBe(1)
    expect(stats.employeesByDepartment.engineering).toBe(0)
  })
})

describe("getDashboardStats", () => {
  it("aggregates and returns data when both fetches succeed", async () => {
    mockCustomersGetAll.mockResolvedValue({
      data: { data: [makeCustomer()], total: 1, page: 1, pageSize: 1000, totalPages: 1 },
      error: null,
    })
    mockEmployeesGetAll.mockResolvedValue({
      data: { data: [makeEmployee()], total: 1, page: 1, pageSize: 1000, totalPages: 1 },
      error: null,
    })

    const { data, error } = await getDashboardStats()

    expect(error).toBeNull()
    expect(data?.totalCustomers).toBe(1)
    expect(data?.totalEmployees).toBe(1)
  })

  it("surfaces the customers error instead of silently rendering an all-zero dashboard (regression guard)", async () => {
    mockCustomersGetAll.mockResolvedValue({
      data: null,
      error: { message: "boom", code: "SERVER_ERROR", status: 500 },
    })
    mockEmployeesGetAll.mockResolvedValue({
      data: { data: [makeEmployee()], total: 1, page: 1, pageSize: 1000, totalPages: 1 },
      error: null,
    })

    const { data, error } = await getDashboardStats()

    expect(data).toBeNull()
    expect(error).toEqual({ message: "boom", code: "SERVER_ERROR", status: 500 })
  })

  it("surfaces the employees error when customers succeeds but employees fails", async () => {
    mockCustomersGetAll.mockResolvedValue({
      data: { data: [makeCustomer()], total: 1, page: 1, pageSize: 1000, totalPages: 1 },
      error: null,
    })
    mockEmployeesGetAll.mockResolvedValue({
      data: null,
      error: { message: "employees down", code: "SERVER_ERROR", status: 500 },
    })

    const { data, error } = await getDashboardStats()

    expect(data).toBeNull()
    expect(error).toEqual({ message: "employees down", code: "SERVER_ERROR", status: 500 })
  })
})
