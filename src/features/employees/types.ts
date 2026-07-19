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
