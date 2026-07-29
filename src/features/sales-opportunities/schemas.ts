import { z } from "zod"
import { OPPORTUNITY_STATUSES } from "./constants"

// getOpportunities() is a Server Action — directly callable regardless of
// which UI called it — so its params need the same validation as any other
// external input, not just what the UI happens to send.
export const getOpportunitiesParamsSchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  search: z.string().max(200).optional(),
  customerId: z.string().max(50).optional(),
  salesRepId: z.string().max(50).optional(),
  status: z.enum(OPPORTUNITY_STATUSES).optional(),
  createdFrom: z.iso.date().optional(),
  createdTo: z.iso.date().optional(),
})

export const opportunityIdSchema = z.string().min(1)
