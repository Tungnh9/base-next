"use server"

import { requireSession, unauthorizedError } from "@/lib/auth"
import { customerApi } from "./api"
import { createCustomerSchema, updateCustomerSchema } from "./schemas"
import type { CreateCustomerInput, UpdateCustomerInput } from "./types"

export async function getCustomers() {
  const session = await requireSession()
  if (!session) return { data: null, error: unauthorizedError() }
  return customerApi.getAll()
}

export async function getCustomerById(id: string) {
  const session = await requireSession()
  if (!session) return { data: null, error: unauthorizedError() }
  return customerApi.getById(id)
}

export async function createCustomer(input: CreateCustomerInput) {
  const session = await requireSession()
  if (!session) return { data: null, error: unauthorizedError() }

  const parsed = createCustomerSchema.safeParse(input)
  if (!parsed.success)
    return {
      data: null,
      error: { message: "Dữ liệu không hợp lệ", code: "VALIDATION_ERROR", status: 400 },
    }
  return customerApi.create(parsed.data)
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const session = await requireSession()
  if (!session) return { data: null, error: unauthorizedError() }

  const parsed = updateCustomerSchema.safeParse(input)
  if (!parsed.success)
    return {
      data: null,
      error: { message: "Dữ liệu không hợp lệ", code: "VALIDATION_ERROR", status: 400 },
    }
  return customerApi.update(id, parsed.data)
}

export async function deleteCustomer(id: string) {
  const session = await requireSession()
  if (!session) return { data: null, error: unauthorizedError() }
  return customerApi.delete(id)
}
