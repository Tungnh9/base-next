import { serverApi } from "@/lib/api"
import { USE_MOCK_API } from "@/lib/mock"
import { customerMockApi } from "./mock-data"
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "./types"

const customerRealApi = {
  getAll: () => serverApi<Customer[]>("/customers"),
  getById: (id: string) => serverApi<Customer>(`/customers/${id}`),
  create: (input: CreateCustomerInput) =>
    serverApi<Customer>("/customers", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: UpdateCustomerInput) =>
    serverApi<Customer>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  delete: (id: string) => serverApi<void>(`/customers/${id}`, { method: "DELETE" }),
}

export const customerApi = USE_MOCK_API ? customerMockApi : customerRealApi
