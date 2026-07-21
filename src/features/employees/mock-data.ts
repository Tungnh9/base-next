import { mockApi, mockApiError } from "@/lib/mock"
import type {
  Employee,
  EmployeeDepartment,
  EmployeeStatus,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  GetEmployeesParams,
} from "./types"
import type { PaginatedResponse } from "@/types"

const FIRST_NAMES = [
  "Nguyễn Văn",
  "Trần Thị",
  "Lê Minh",
  "Phạm Đức",
  "Hoàng Thị",
  "Vũ Quang",
  "Đặng Thu",
  "Bùi Anh",
  "Đỗ Ngọc",
  "Ngô Bảo",
]
const LAST_NAMES = [
  "An",
  "Bình",
  "Châu",
  "Dũng",
  "Lan",
  "Hải",
  "Hương",
  "Khang",
  "Linh",
  "Minh",
  "Nam",
  "Oanh",
]
const DEPARTMENTS: EmployeeDepartment[] = [
  "engineering",
  "sales",
  "marketing",
  "hr",
  "finance",
  "support",
]
const POSITIONS_BY_DEPARTMENT: Record<EmployeeDepartment, string[]> = {
  engineering: ["Frontend Engineer", "Backend Engineer", "DevOps Engineer"],
  sales: ["Sales Executive", "Account Manager"],
  marketing: ["Marketing Specialist", "Content Strategist"],
  hr: ["HR Generalist", "Recruiter"],
  finance: ["Accountant", "Financial Analyst"],
  support: ["Support Specialist", "Support Lead"],
}
// Weighted so most fixtures land on "active" — closer to a real headcount split.
const STATUSES: EmployeeStatus[] = ["active", "active", "active", "inactive", "on-leave"]

// Deterministic (no Math.random/Date.now) so fixtures and any test asserting
// against them stay stable across runs.
function buildEmployees(count: number): Employee[] {
  return Array.from({ length: count }, (_, i) => {
    const department = DEPARTMENTS[i % DEPARTMENTS.length]
    const positions = POSITIONS_BY_DEPARTMENT[department]
    return {
      id: String(i + 1),
      name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3 + 1) % LAST_NAMES.length]}`,
      email: `employee${i + 1}@example.com`,
      phone: `09${String(10_000_000 + i * 37)
        .padStart(8, "0")
        .slice(0, 8)}`,
      department,
      position: positions[i % positions.length],
      status: STATUSES[i % STATUSES.length],
      joinedAt: new Date(Date.UTC(2022, i % 12, (i % 27) + 1)).toISOString(),
    }
  })
}

// 24 fixtures — enough to span 3 pages at the UI's default pageSize of 10,
// with a partial last page, so pagination edge cases are visible in the demo.
let employees: Employee[] = buildEmployees(24)
let idCounter = employees.length + 1

export const employeeMockApi = {
  getAll: (params: GetEmployeesParams = {}) => {
    const { search = "", page = 1, pageSize = 10 } = params
    const normalizedSearch = search.trim().toLowerCase()

    const filtered = normalizedSearch
      ? employees.filter(
          (e) =>
            e.name.toLowerCase().includes(normalizedSearch) ||
            e.email.toLowerCase().includes(normalizedSearch)
        )
      : employees

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * pageSize

    return mockApi<PaginatedResponse<Employee>>({
      data: filtered.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
    })
  },

  getById: (id: string) => {
    const found = employees.find((e) => e.id === id)
    if (!found)
      return mockApiError({ message: "Employee not found", code: "NOT_FOUND", status: 404 })
    return mockApi<Employee>(found)
  },

  create: (input: CreateEmployeeInput) => {
    const next: Employee = {
      id: String(idCounter++),
      ...input,
      joinedAt: new Date().toISOString(),
    }
    employees = [...employees, next]
    return mockApi<Employee>(next)
  },

  update: (id: string, input: UpdateEmployeeInput) => {
    const idx = employees.findIndex((e) => e.id === id)
    if (idx === -1)
      return mockApiError({ message: "Employee not found", code: "NOT_FOUND", status: 404 })
    employees = employees.map((e) => (e.id === id ? { ...e, ...input } : e))
    return mockApi<Employee>(employees[idx])
  },

  delete: (id: string) => {
    employees = employees.filter((e) => e.id !== id)
    return mockApi<void>(undefined)
  },
}
