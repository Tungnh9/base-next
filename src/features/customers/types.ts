export type CustomerStatus = "active" | "inactive"

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: CustomerStatus
  createdAt: string
}

export interface CreateCustomerInput {
  name: string
  email: string
  phone: string
  company: string
  status: CustomerStatus
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>

export interface CustomerFilters {
  search?: string
  status?: CustomerStatus | ""
}
