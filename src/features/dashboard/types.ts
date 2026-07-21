import type { CustomerStatus } from "@/features/customers/types"
import {
  STATUS_VARIANT,
  type EmployeeStatus,
  type EmployeeDepartment,
} from "@/features/employees/types"

export interface DashboardStats {
  totalCustomers: number
  totalEmployees: number
  customersByStatus: Record<CustomerStatus, number>
  employeesByStatus: Record<EmployeeStatus, number>
  employeesByDepartment: Record<EmployeeDepartment, number>
}

// Canonical lists of every literal value in the corresponding union type.
// Needed at runtime to zero-initialize the Record<..., number> breakdowns
// above (a union type itself carries no runtime information) and to drive
// chart/stat-card rendering without hardcoding the value set a second time.
// If CustomerStatus/EmployeeStatus/EmployeeDepartment ever gain or drop a
// member in their source features, update these arrays to match.
export const CUSTOMER_STATUSES: CustomerStatus[] = ["active", "inactive"]

export const EMPLOYEE_STATUSES: EmployeeStatus[] = ["active", "inactive", "on-leave"]

export const EMPLOYEE_DEPARTMENTS: EmployeeDepartment[] = [
  "engineering",
  "sales",
  "marketing",
  "hr",
  "finance",
  "support",
]

// Maps a status value (customer or employee) to its i18n key under the
// "dashboard" namespace. Keyed by EmployeeStatus since it's the superset —
// CustomerStatus values ("active" | "inactive") index into it just fine.
export const STATUS_LABEL_KEYS: Record<EmployeeStatus, "active" | "inactive" | "onLeave"> = {
  active: "active",
  inactive: "inactive",
  "on-leave": "onLeave",
}

// Re-exported for existing importers (e.g. dashboard/page.tsx) — the
// canonical status→variant map now lives in @/features/employees/types
// since it's also used directly by employee-list.tsx/employee-detail.tsx.
// "inactive" maps to "danger" rather than "secondary": in the dark theme,
// --secondary (#3b4261) resolves to the exact same color as --muted
// (the ProgressStack track background), making a "secondary" segment
// invisible against its own track.
export { STATUS_VARIANT }
