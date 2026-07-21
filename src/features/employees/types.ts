import type { PaginationParams } from "@/types"

export type EmployeeStatus = "active" | "inactive" | "on-leave"

export type EmployeeDepartment =
  "engineering" | "sales" | "marketing" | "hr" | "finance" | "support"

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: EmployeeDepartment
  position: string
  status: EmployeeStatus
  joinedAt: string
}

export interface CreateEmployeeInput {
  name: string
  email: string
  phone: string
  department: EmployeeDepartment
  position: string
  status: EmployeeStatus
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput>

export interface EmployeeFilters {
  search?: string
}

export interface GetEmployeesParams extends PaginationParams, EmployeeFilters {}

// Canonical status → Badge/ProgressSegment variant mapping. Single source of
// truth shared by employee-list.tsx, employee-detail.tsx, and (via
// re-export) the dashboard feature's status-breakdown bars — previously
// duplicated byte-for-byte in three places.
export const STATUS_VARIANT: Record<EmployeeStatus, "success" | "danger" | "warning"> = {
  active: "success",
  inactive: "danger",
  "on-leave": "warning",
}
