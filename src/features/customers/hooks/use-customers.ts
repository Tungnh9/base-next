"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../actions"
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "../types"

export function useCustomers() {
  const t = useTranslations("customers.toast")
  // isLoading starts true so the initial render shows skeleton immediately
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tick, setTick] = useState(0)

  // setState calls inside the async .then() are fine — they happen in callbacks,
  // not synchronously in the effect body (satisfies react-hooks/set-state-in-effect)
  useEffect(() => {
    getCustomers().then(({ data, error }) => {
      if (error) toast.error(error.message)
      else setCustomers(data ?? [])
      setIsLoading(false)
    })
  }, [tick])

  // refresh() sets isLoading from an event handler context — not inside an effect body
  const refresh = useCallback(() => {
    setIsLoading(true)
    setTick((t) => t + 1)
  }, [])

  async function handleCreate(input: CreateCustomerInput) {
    const { data, error } = await createCustomer(input)
    if (error) {
      toast.error(error.message)
      return false
    }
    setCustomers((prev) => [...prev, data])
    toast.success("Thêm khách hàng thành công")
    return true
  }

  async function handleUpdate(id: string, input: UpdateCustomerInput) {
    const { data, error } = await updateCustomer(id, input)
    if (error) {
      toast.error(error.message)
      return false
    }
    setCustomers((prev) => prev.map((c) => (c.id === id ? data : c)))
    toast.success("Cập nhật thành công")
    return true
  }

  async function handleDelete(id: string) {
    const { error } = await deleteCustomer(id)
    if (error) {
      toast.error(error.message)
      return false
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    toast.success(t("deleteSuccess"))
    return true
  }

  async function handleDeleteMany(ids: string[]) {
    const results = await Promise.all(ids.map((id) => deleteCustomer(id)))
    const failedCount = results.filter((r) => r.error).length
    const succeededIds = new Set(ids.filter((_, i) => !results[i].error))

    setCustomers((prev) => prev.filter((c) => !succeededIds.has(c.id)))

    if (failedCount > 0) {
      toast.error(t("deleteManyPartialFail", { failed: failedCount, total: ids.length }))
    } else {
      toast.success(t("deleteManySuccess", { count: ids.length }))
    }
    return failedCount === 0
  }

  return {
    customers,
    isLoading,
    refresh,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleDeleteMany,
  }
}
