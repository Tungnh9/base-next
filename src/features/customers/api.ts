import { serverApi } from "@/lib/api"
import { USE_MOCK_API } from "@/lib/mock"
import { customerMockApi } from "./mock-data"
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  GetCustomersParams,
} from "./types"
import type { PaginatedResponse } from "@/types"

const customerRealApi = {
  getAll: (params: GetCustomersParams = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set("page", String(params.page))
    if (params.pageSize) query.set("pageSize", String(params.pageSize))
    if (params.search) query.set("search", params.search)
    if (params.classification) query.set("classification", params.classification)
    if (params.industry) query.set("industry", params.industry)
    if (params.status) query.set("status", params.status)
    const qs = query.toString()
    return serverApi<PaginatedResponse<Customer>>(`/customers${qs ? `?${qs}` : ""}`)
  },
  getById: (id: string) => serverApi<Customer>(`/customers/${id}`),
  create: (input: CreateCustomerInput) =>
    serverApi<Customer>("/customers", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: UpdateCustomerInput) =>
    serverApi<Customer>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  delete: (id: string) => serverApi<void>(`/customers/${id}`, { method: "DELETE" }),
}

export const customerApi = USE_MOCK_API ? customerMockApi : customerRealApi
