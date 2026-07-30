"use server"

import { requireSession, unauthorizedError } from "@/lib/auth"
import { opportunityApi } from "./api"
import { getOpportunitiesParamsSchema, opportunityIdSchema } from "./schemas"
import type { GetOpportunitiesParams } from "./types"

export async function getOpportunities(params: GetOpportunitiesParams = {}) {
  const session = await requireSession()
  if (!session) return { data: null, error: unauthorizedError() }

  const parsed = getOpportunitiesParamsSchema.safeParse(params)
  if (!parsed.success)
    return {
      data: null,
      error: { message: "Dữ liệu không hợp lệ", code: "VALIDATION_ERROR", status: 400 },
    }
  return opportunityApi.getAll(parsed.data)
}

export async function deleteOpportunity(id: string) {
  const session = await requireSession()
  if (!session) return { data: null, error: unauthorizedError() }

  const parsed = opportunityIdSchema.safeParse(id)
  if (!parsed.success)
    return {
      data: null,
      error: { message: "Dữ liệu không hợp lệ", code: "VALIDATION_ERROR", status: 400 },
    }
  return opportunityApi.delete(parsed.data)
}
