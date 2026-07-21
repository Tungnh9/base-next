import type { CustomerStatus } from "@/features/customers/types"
import type { EmployeeStatus, EmployeeDepartment } from "@/features/employees/types"
import type { ProgressVariant } from "@/components/ui/progress"

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

// Same superset-keying idea as STATUS_LABEL_KEYS — maps a status value to the
// semantic ProgressSegment color used in the dashboard's breakdown bars.
// "inactive" uses "info" rather than "secondary": in the dark theme,
// --secondary (#3b4261) resolves to the exact same color as --muted
// (the ProgressStack track background), making a "secondary" segment
// invisible against its own track.
export const STATUS_VARIANT: Record<EmployeeStatus, ProgressVariant> = {
  active: "success",
  inactive: "info",
  "on-leave": "warning",
}
