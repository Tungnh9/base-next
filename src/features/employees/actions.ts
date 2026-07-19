"use server"

import { requireSession, unauthorizedError, forbiddenError } from "@/lib/auth"
import { employeeApi } from "./api"
import { createEmployeeSchema, updateEmployeeSchema } from "./schemas"
import type { CreateEmployeeInput, UpdateEmployeeInput, GetEmployeesParams } from "./types"
import type { ApiError } from "@/types"

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
  return employeeApi.getAll(params)
}

export async function getEmployeeById(id: string) {
  const error = await requireAdmin()
  if (error) return { data: null, error }
  return employeeApi.getById(id)
}

export async function createEmployee(input: CreateEmployeeInput) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsed = createEmployeeSchema.safeParse(input)
  if (!parsed.success)
    return {
      data: null,
      error: { message: "Dữ liệu không hợp lệ", code: "VALIDATION_ERROR", status: 400 },
    }
  return employeeApi.create(parsed.data)
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  const error = await requireAdmin()
  if (error) return { data: null, error }

  const parsed = updateEmployeeSchema.safeParse(input)
  if (!parsed.success)
    return {
      data: null,
      error: { message: "Dữ liệu không hợp lệ", code: "VALIDATION_ERROR", status: 400 },
    }
  return employeeApi.update(id, parsed.data)
}

export async function deleteEmployee(id: string) {
  const error = await requireAdmin()
  if (error) return { data: null, error }
  return employeeApi.delete(id)
}
