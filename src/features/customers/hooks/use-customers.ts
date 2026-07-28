"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../actions"
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerClassification,
  CustomerIndustry,
  CustomerStatus,
} from "../types"

const PAGE_SIZE = 10

export function useCustomers() {
  const t = useTranslations("customers.toast")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [classification, setClassification] = useState<CustomerClassification | undefined>(
    undefined
  )
  const [industry, setIndustry] = useState<CustomerIndustry | undefined>(undefined)
  const [status, setStatus] = useState<CustomerStatus | undefined>(undefined)
  // isLoading starts true so the initial render shows skeleton immediately
  const [isLoading, setIsLoading] = useState(true)
  const [tick, setTick] = useState(0)

  // setState calls inside the async .then() are fine — they happen in callbacks,
  // not synchronously in the effect body (satisfies react-hooks/set-state-in-effect)
  useEffect(() => {
    getCustomers({ page, pageSize: PAGE_SIZE, search, classification, industry, status }).then(
      ({ data, error }) => {
        if (error) {
          toast.error(error.message)
        } else if (data) {
          setCustomers(data.data)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
        setIsLoading(false)
      }
    )
  }, [page, search, classification, industry, status, tick])

  // refresh() sets isLoading from an event handler context — not inside an effect body
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

  const updateClassification = useCallback((value: CustomerClassification | undefined) => {
    setClassification(value)
    setPage(1)
  }, [])

  const updateIndustry = useCallback((value: CustomerIndustry | undefined) => {
    setIndustry(value)
    setPage(1)
  }, [])

  const updateStatus = useCallback((value: CustomerStatus | undefined) => {
    setStatus(value)
    setPage(1)
  }, [])

  async function handleCreate(input: CreateCustomerInput) {
    const { error } = await createCustomer(input)
    if (error) {
      toast.error(error.message)
      return false
    }
    toast.success(t("createSuccess"))
    refresh()
    return true
  }

  async function handleUpdate(id: string, input: UpdateCustomerInput) {
    const { data, error } = await updateCustomer(id, input)
    if (error) {
      toast.error(error.message)
      return false
    }
    setCustomers((prev) => prev.map((c) => (c.id === id ? data : c)))
    toast.success(t("updateSuccess"))
    return true
  }

  async function handleDelete(id: string) {
    const { error } = await deleteCustomer(id)
    if (error) {
      toast.error(error.message)
      return false
    }
    toast.success(t("deleteSuccess"))
    refresh()
    return true
  }

  async function handleDeleteMany(ids: string[]) {
    const results = await Promise.all(ids.map((id) => deleteCustomer(id)))
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
    customers,
    total,
    totalPages,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    search,
    setSearch: updateSearch,
    classification,
    setClassification: updateClassification,
    industry,
    setIndustry: updateIndustry,
    status,
    setStatus: updateStatus,
    isLoading,
    refresh,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleDeleteMany,
  }
}
