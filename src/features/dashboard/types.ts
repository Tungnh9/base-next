import {
  STATUS_VARIANT as CUSTOMER_STATUS_VARIANT,
  type CustomerStatus,
} from "@/features/customers/types"
import {
  STATUS_VARIANT as EMPLOYEE_STATUS_VARIANT,
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
export const CUSTOMER_STATUSES: CustomerStatus[] = ["collaborating", "paused", "potential"]

export const EMPLOYEE_STATUSES: EmployeeStatus[] = ["active", "inactive", "on-leave"]

export const EMPLOYEE_DEPARTMENTS: EmployeeDepartment[] = [
  "engineering",
  "sales",
  "marketing",
  "hr",
  "finance",
  "support",
]

// Employee-status → i18n key under the "dashboard" namespace. Employee-only
// now — customer status labels are resolved directly from the "customers"
// namespace instead (status.<value> matches CustomerStatus's own literals
// with no remapping needed), since "Đang hợp tác"/"Tạm dừng"/"Tiềm năng"
// don't fit the generic dashboard.active/inactive/onLeave labels shared
// across employee statuses.
export const STATUS_LABEL_KEYS: Record<EmployeeStatus, "active" | "inactive" | "onLeave"> = {
  active: "active",
  inactive: "inactive",
  "on-leave": "onLeave",
}

// Re-exported for existing importers (e.g. dashboard/page.tsx). Customer and
// employee status→variant maps are independent now that the two enums no
// longer share any values — each canonical map still lives with its owning
// feature (employees/types.ts, customers/types.ts) since it's also used
// directly by that feature's own list/detail components.
export { CUSTOMER_STATUS_VARIANT, EMPLOYEE_STATUS_VARIANT }
