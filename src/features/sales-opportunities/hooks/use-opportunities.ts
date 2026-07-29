"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { getOpportunities, deleteOpportunity } from "../actions"
import type { SalesOpportunity, OpportunityStatus } from "../types"
import type { DateRange } from "@/components/ui/date-picker"

const PAGE_SIZE = 10

// RangeCalendar builds Date objects at local midnight (`new Date(y,m,d)`) —
// toISOString() would shift the date backward by a day in UTC+7. Extracting
// the key from the local getters avoids that.
function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function useOpportunities() {
  const t = useTranslations("salesOpportunities.toast")
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [customerId, setCustomerIdState] = useState<string | undefined>(undefined)
  const [salesRepId, setSalesRepIdState] = useState<string | undefined>(undefined)
  const [status, setStatusState] = useState<OpportunityStatus | undefined>(undefined)
  const [dateRange, setDateRangeState] = useState<DateRange | undefined>(undefined)
  // isLoading starts true so the initial render shows skeleton immediately
  const [isLoading, setIsLoading] = useState(true)
  const [tick, setTick] = useState(0)

  // A range picked halfway through (only `from` set) must not filter yet —
  // RangeCalendar fires onChange after the first click with `to: undefined`.
  const createdFrom = dateRange?.from && dateRange?.to ? toDateKey(dateRange.from) : undefined
  const createdTo = dateRange?.from && dateRange?.to ? toDateKey(dateRange.to) : undefined

  // setState calls inside the async .then() are fine — they happen in callbacks,
  // not synchronously in the effect body (satisfies react-hooks/set-state-in-effect)
  useEffect(() => {
    getOpportunities({
      page,
      pageSize: PAGE_SIZE,
      search,
      customerId,
      salesRepId,
      status,
      createdFrom,
      createdTo,
    }).then(({ data, error }) => {
      if (error) {
        toast.error(error.message)
      } else if (data) {
        setOpportunities(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
      setIsLoading(false)
    })
  }, [page, search, customerId, salesRepId, status, createdFrom, createdTo, tick])

  const refresh = useCallback(() => {
    setIsLoading(true)
    setTick((t) => t + 1)
  }, [])

  // A stale page number could point past the newly-filtered result set, so
  // every filter change jumps back to page 1
  const updateSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const updateCustomerId = useCallback((value: string | undefined) => {
    setCustomerIdState(value)
    setPage(1)
  }, [])

  const updateSalesRepId = useCallback((value: string | undefined) => {
    setSalesRepIdState(value)
    setPage(1)
  }, [])

  const updateStatus = useCallback((value: OpportunityStatus | undefined) => {
    setStatusState(value)
    setPage(1)
  }, [])

  const updateDateRange = useCallback((value: DateRange | undefined) => {
    setDateRangeState(value)
    setPage(1)
  }, [])

  async function handleDelete(id: string) {
    const { error } = await deleteOpportunity(id)
    if (error) {
      toast.error(error.message)
      return false
    }
    toast.success(t("deleteSuccess"))
    refresh()
    return true
  }

  async function handleDeleteMany(ids: string[]) {
    const results = await Promise.all(ids.map((id) => deleteOpportunity(id)))
    const failedCount = results.filter((r) => r.error).length

    if (failedCount > 0) {
      toast.error(t("deleteManyPartialFail", { failed: failedCount, total: ids.length }))
    } else {
      toast.success(t("deleteManySuccess", { count: ids.length }))
    }
    refresh()
    return failedCount === 0
  }

  return {
    opportunities,
    total,
    totalPages,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    search,
    setSearch: updateSearch,
    customerId,
    setCustomerId: updateCustomerId,
    salesRepId,
    setSalesRepId: updateSalesRepId,
    status,
    setStatus: updateStatus,
    dateRange,
    setDateRange: updateDateRange,
    isLoading,
    refresh,
    handleDelete,
    handleDeleteMany,
  }
}
