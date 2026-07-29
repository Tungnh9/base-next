"use client"

import { useCallback } from "react"
import { useTranslations } from "next-intl"
import { useCustomerOptions } from "./use-customer-options"

// Same shape as employees' useResolveEmployeeName — used by the Sales
// Opportunities table to resolve a customerId to a display name without
// mislabeling a valid-but-not-yet-loaded id as "unknown".
export function useResolveCustomerName() {
  const t = useTranslations("customers")
  const { options, isLoading } = useCustomerOptions()

  return useCallback(
    (id?: string): string | undefined => {
      if (!id) return undefined
      if (isLoading) return undefined
      const match = options.find((option) => option.id === id)
      return match ? match.name : t("unknownCustomer", { id })
    },
    [t, options, isLoading]
  )
}
