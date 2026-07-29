import { mockApi } from "@/lib/mock"
import type { SalesOpportunity, GetOpportunitiesParams } from "./types"
import type { PaginatedResponse } from "@/types"

// No form/detail page yet (list-only this round), so there's no reasonable
// field data to seed fixtures from — unlike customers/employees, this starts
// empty rather than shipping guessed-at sample rows.
let opportunities: SalesOpportunity[] = []

function toDateKey(iso: string): string {
  return iso.slice(0, 10)
}

export const opportunityMockApi = {
  getAll: (params: GetOpportunitiesParams = {}) => {
    const {
      search = "",
      page = 1,
      pageSize = 10,
      customerId,
      salesRepId,
      status,
      createdFrom,
      createdTo,
    } = params
    const normalizedSearch = search.trim().toLowerCase()

    let filtered = opportunities
    if (normalizedSearch) {
      filtered = filtered.filter((o) => o.name.toLowerCase().includes(normalizedSearch))
    }
    if (customerId) filtered = filtered.filter((o) => o.customerId === customerId)
    if (salesRepId) filtered = filtered.filter((o) => o.salesRepId === salesRepId)
    if (status) filtered = filtered.filter((o) => o.status === status)
    // "YYYY-MM-DD" string comparison is lexicographic = chronological.
    if (createdFrom) filtered = filtered.filter((o) => toDateKey(o.createdAt) >= createdFrom)
    if (createdTo) filtered = filtered.filter((o) => toDateKey(o.createdAt) <= createdTo)

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * pageSize

    return mockApi<PaginatedResponse<SalesOpportunity>>({
      data: filtered.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
    })
  },

  // Silently no-ops for an id that doesn't exist — mirrors customerMockApi.delete.
  delete: (id: string) => {
    opportunities = opportunities.filter((o) => o.id !== id)
    return mockApi<void>(undefined)
  },
}
