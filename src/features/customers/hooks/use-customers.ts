"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../actions"
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from "../types"

export function useCustomers() {
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
    toast.success("Đã xóa khách hàng")
    return true
  }

  return { customers, isLoading, refresh, handleCreate, handleUpdate, handleDelete }
}
