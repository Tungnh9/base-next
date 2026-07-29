"use server"

import { requireSession, unauthorizedError } from "@/lib/auth"
import { customerApi } from "./api"
import { createCustomerSchema, updateCustomerSchema, getCustomersParamsSchema } from "./schemas"
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  GetCustomersParams,
  CustomerOption,
} from "./types"

export async function getCustomers(params: GetCustomersParams = {}) {
  const session = await requireSession()
  if (!session) return { data: null, error: unauthorizedError() }

  const parsed = getCustomersParamsSchema.safeParse(params)
  if (!parsed.success)
    return {
      data: null,
      error: { message: "Dữ liệu không hợp lệ", code: "VALIDATION_ERROR", status: 400 },
    }
  return customerApi.getAll(parsed.data)
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

// Picker data source for other features (e.g. the Sales Opportunities filter
// bar/table). Session-gated like every action in this file — unlike
// employees, there's no auth-bypass motive here (getCustomers() is already
// not admin-gated). Two reasons it exists anyway:
//
// 1. Data minimization: getCustomers() returns full Customer records with
//    email/phone/taxCode/contacts/notes. A dropdown in another feature needs
//    id + name + code and nothing else.
// 2. getCustomersParamsSchema caps pageSize at 100, so a one-page fetch of
//    every customer can't go through getCustomers() at all — the same wall
//    getEmployeeOptions() hit.
//
// Same fetch-one-big-page shortcut as getEmployeeOptions()/dashboard/api.ts:
// fine at this template's scale, but a real backend should expose
// GET /customers/options instead of shipping every row.
const CUSTOMER_OPTIONS_PAGE_SIZE = 1000

export async function getCustomerOptions() {
  const session = await requireSession()
  if (!session) return { data: null, error: unauthorizedError() }

  const { data, error } = await customerApi.getAll({ pageSize: CUSTOMER_OPTIONS_PAGE_SIZE })
  if (error) return { data: null, error }

  const options: CustomerOption[] = (data?.data ?? []).map(({ id, name, code }) => ({
    id,
    name,
    code,
  }))
  return { data: options, error: null }
}
