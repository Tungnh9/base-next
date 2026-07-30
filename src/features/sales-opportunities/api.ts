import { serverApi } from "@/lib/api"
import { USE_MOCK_API } from "@/lib/mock"
import { opportunityMockApi } from "./mock-data"
import type { SalesOpportunity, GetOpportunitiesParams } from "./types"
import type { PaginatedResponse } from "@/types"

const opportunityRealApi = {
  getAll: (params: GetOpportunitiesParams = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set("page", String(params.page))
    if (params.pageSize) query.set("pageSize", String(params.pageSize))
    if (params.search) query.set("search", params.search)
    if (params.customerId) query.set("customerId", params.customerId)
    if (params.salesRepId) query.set("salesRepId", params.salesRepId)
    if (params.status) query.set("status", params.status)
    if (params.createdFrom) query.set("createdFrom", params.createdFrom)
    if (params.createdTo) query.set("createdTo", params.createdTo)
    const qs = query.toString()
    return serverApi<PaginatedResponse<SalesOpportunity>>(
      `/sales-opportunities${qs ? `?${qs}` : ""}`
    )
  },
  delete: (id: string) => serverApi<void>(`/sales-opportunities/${id}`, { method: "DELETE" }),
}

export const opportunityApi = USE_MOCK_API ? opportunityMockApi : opportunityRealApi
