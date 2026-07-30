import type { PaginationParams } from "@/types"
import { OPPORTUNITY_STATUSES } from "./constants"

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number]

export interface SalesOpportunity {
  id: string
  name: string
  /** Customer.id */
  customerId: string
  contractValue: number
  /** Employee.id — "NVKD phụ trách". */
  salesRepId: string
  status: OpportunityStatus
  createdAt: string
}

export interface OpportunityFilters {
  search?: string
  customerId?: string
  salesRepId?: string
  status?: OpportunityStatus
  /** ISO date-only string ("YYYY-MM-DD"), inclusive lower bound. */
  createdFrom?: string
  /** ISO date-only string ("YYYY-MM-DD"), inclusive upper bound. */
  createdTo?: string
}

export interface GetOpportunitiesParams extends PaginationParams, OpportunityFilters {}

// Canonical status → Badge variant mapping (mirrors customers/employees'
// own STATUS_VARIANT).
export const STATUS_VARIANT: Record<OpportunityStatus, "success" | "warning" | "info"> = {
  processing: "info",
  "pending-approval": "warning",
  transferred: "success",
}
