import { customerApi } from "@/features/customers/api"
import { employeeApi } from "@/features/employees/api"
import type { Customer } from "@/features/customers/types"
import type { Employee } from "@/features/employees/types"
import {
  CUSTOMER_STATUSES,
  EMPLOYEE_STATUSES,
  EMPLOYEE_DEPARTMENTS,
  type DashboardStats,
} from "./types"

// Large enough to cover the whole customers/employees mock datasets (24 rows
// each) in a single page — see the comment on getDashboardStats for why
// fetch-all is acceptable here.
const CUSTOMER_PAGE_SIZE = 1000
const EMPLOYEE_PAGE_SIZE = 1000

function zeroRecord<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>
}

// Pure aggregation — no network/mock involved, so it's trivial to unit test
// with hand-built fixtures.
export function aggregateStats(customers: Customer[], employees: Employee[]): DashboardStats {
  const customersByStatus = zeroRecord(CUSTOMER_STATUSES)
  for (const customer of customers) {
    customersByStatus[customer.status] += 1
  }

  const employeesByStatus = zeroRecord(EMPLOYEE_STATUSES)
  const employeesByDepartment = zeroRecord(EMPLOYEE_DEPARTMENTS)
  for (const employee of employees) {
    employeesByStatus[employee.status] += 1
    employeesByDepartment[employee.department] += 1
  }

  return {
    totalCustomers: customers.length,
    totalEmployees: employees.length,
    customersByStatus,
    employeesByStatus,
    employeesByDepartment,
  }
}

// Fetches the full customer list and a large-enough single page of employees
// via the existing feature APIs, then aggregates in memory.
//
// This fetch-everything-then-aggregate approach is fine at this
// template/demo scale (a handful of mock rows), but a real backend with
// large datasets should expose a dedicated aggregate/stats endpoint instead
// of shipping every row to the server just to compute counts.
export async function getDashboardStats(): Promise<DashboardStats> {
  const [customersRes, employeesRes] = await Promise.all([
    customerApi.getAll({ pageSize: CUSTOMER_PAGE_SIZE }),
    employeeApi.getAll({ pageSize: EMPLOYEE_PAGE_SIZE }),
  ])

  const customers = customersRes.data?.data ?? []
  const employees = employeesRes.data?.data ?? []

  return aggregateStats(customers, employees)
}
