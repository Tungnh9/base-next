import { mockApi, mockApiError } from "@/lib/mock"
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "./types"

let customers: Customer[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    email: "an.nguyen@example.com",
    phone: "0901234567",
    company: "Công ty ABC",
    status: "active",
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    email: "binh.tran@example.com",
    phone: "0912345678",
    company: "Tập đoàn XYZ",
    status: "active",
    createdAt: "2024-02-20T09:30:00Z",
  },
  {
    id: "3",
    name: "Lê Minh Châu",
    email: "chau.le@example.com",
    phone: "0923456789",
    company: "Startup Tech",
    status: "inactive",
    createdAt: "2024-03-10T14:00:00Z",
  },
  {
    id: "4",
    name: "Phạm Đức Dũng",
    email: "dung.pham@acme.vn",
    phone: "0934567890",
    company: "ACME Vietnam",
    status: "active",
    createdAt: "2024-04-05T11:00:00Z",
  },
  {
    id: "5",
    name: "Hoàng Thị Lan",
    email: "lan.hoang@globex.com",
    phone: "0945678901",
    company: "Globex Corp",
    status: "active",
    createdAt: "2024-05-01T10:00:00Z",
  },
]

let idCounter = customers.length + 1

export const customerMockApi = {
  getAll: () => mockApi<Customer[]>(customers),

  getById: (id: string) => {
    const found = customers.find((c) => c.id === id)
    if (!found)
      return mockApiError({ message: "Customer not found", code: "NOT_FOUND", status: 404 })
    return mockApi<Customer>(found)
  },

  create: (input: CreateCustomerInput) => {
    const next: Customer = {
      id: String(idCounter++),
      ...input,
      createdAt: new Date().toISOString(),
    }
    customers = [...customers, next]
    return mockApi<Customer>(next)
  },

  update: (id: string, input: UpdateCustomerInput) => {
    const idx = customers.findIndex((c) => c.id === id)
    if (idx === -1)
      return mockApiError({ message: "Customer not found", code: "NOT_FOUND", status: 404 })
    customers = customers.map((c) => (c.id === id ? { ...c, ...input } : c))
    return mockApi<Customer>(customers[idx])
  },

  delete: (id: string) => {
    customers = customers.filter((c) => c.id !== id)
    return mockApi<void>(undefined)
  },
}
