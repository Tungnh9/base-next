"use server"

import { requireSession, unauthorizedError, forbiddenError } from "@/lib/auth"
import { employeeApi } from "./api"
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeesParamsSchema,
  employeeIdSchema,
} from "./schemas"
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  GetEmployeesParams,
  EmployeeOption,
} from "./types"
import type { ApiError } from "@/types"

const VALIDATION_ERROR: ApiError = {
  message: "Dữ liệu không hợp lệ",
  code: "VALIDATION_ERROR",
  status: 400,
}

// /employees is admin-only. The (protected) layout only proves "logged in",
// and requireRole() (page-level) only protects the page shell — a Server
// Action can be invoked directly regardless of which page rendered, so the
// role check has to be repeated here independently.
async function requireAdmin(): Promise<ApiError | null> {
  const session = await requireSession()
  if (!session) return unauthorizedError()
  if (session.role !== "admin") return forbiddenError()
  return null
}

export async function getEmployees(params: GetEmployeesParams = {}) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsed = getEmployeesParamsSchema.safeParse(params)
  if (!parsed.success) return { data: null, error: VALIDATION_ERROR }
  return employeeApi.getAll(parsed.data)
}

export async function getEmployeeById(id: string) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsedId = employeeIdSchema.safeParse(id)
  if (!parsedId.success) return { data: null, error: VALIDATION_ERROR }
  return employeeApi.getById(parsedId.data)
}

export async function createEmployee(input: CreateEmployeeInput) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsed = createEmployeeSchema.safeParse(input)
  if (!parsed.success) return { data: null, error: VALIDATION_ERROR }
  return employeeApi.create(parsed.data)
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsedId = employeeIdSchema.safeParse(id)
  const parsed = updateEmployeeSchema.safeParse(input)
  if (!parsedId.success || !parsed.success) return { data: null, error: VALIDATION_ERROR }
  return employeeApi.update(parsedId.data, parsed.data)
}

export async function deleteEmployee(id: string) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsedId = employeeIdSchema.safeParse(id)
  if (!parsedId.success) return { data: null, error: VALIDATION_ERROR }
  return employeeApi.delete(parsedId.data)
}

// Assignee-picker data source. Session-gated, NOT admin-gated on purpose:
// /customers is open to every logged-in user (see config/nav.ts — the
// customers nav item has no requiredRole), and its form has to populate the
// NVKD/QLHĐ Selects. To keep that safe, this returns only id/name/department —
// never the full Employee record that the admin-only getEmployees() returns.
//
// Calls employeeApi.getAll directly with a large pageSize rather than going
// through getEmployees(): that action is admin-gated AND its param schema
// caps pageSize at 100. Same fetch-one-big-page shortcut as
// features/dashboard/api.ts — fine at this template's scale, but a real
// backend should expose GET /employees/options instead of shipping every row.
const EMPLOYEE_OPTIONS_PAGE_SIZE = 1000

export async function getEmployeeOptions() {
  const session = await requireSession()
  if (!session) return { data: null, error: unauthorizedError() }

  const { data, error } = await employeeApi.getAll({ pageSize: EMPLOYEE_OPTIONS_PAGE_SIZE })
  if (error) return { data: null, error }

  const options: EmployeeOption[] = (data?.data ?? []).map(({ id, name, department }) => ({
    id,
    name,
    department,
  }))
  return { data: options, error: null }
}
