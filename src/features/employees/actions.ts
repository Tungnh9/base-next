"use server"

import { requireSession, unauthorizedError, forbiddenError } from "@/lib/auth"
import { employeeApi } from "./api"
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeesParamsSchema,
  employeeIdSchema,
} from "./schemas"
import type { CreateEmployeeInput, UpdateEmployeeInput, GetEmployeesParams } from "./types"
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
