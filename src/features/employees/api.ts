import { serverApi } from "@/lib/api"
import { USE_MOCK_API } from "@/lib/mock"
import { employeeMockApi } from "./mock-data"
import type {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  GetEmployeesParams,
} from "./types"
import type { PaginatedResponse } from "@/types"

const employeeRealApi = {
  getAll: (params: GetEmployeesParams = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set("page", String(params.page))
    if (params.pageSize) query.set("pageSize", String(params.pageSize))
    if (params.search) query.set("search", params.search)
    const qs = query.toString()
    return serverApi<PaginatedResponse<Employee>>(`/employees${qs ? `?${qs}` : ""}`)
  },
  getById: (id: string) => serverApi<Employee>(`/employees/${id}`),
  create: (input: CreateEmployeeInput) =>
    serverApi<Employee>("/employees", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: UpdateEmployeeInput) =>
    serverApi<Employee>(`/employees/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  delete: (id: string) => serverApi<void>(`/employees/${id}`, { method: "DELETE" }),
}

export const employeeApi = USE_MOCK_API ? employeeMockApi : employeeRealApi
