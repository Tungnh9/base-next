"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../actions"
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from "../types"

const PAGE_SIZE = 10

export function useEmployees() {
  const t = useTranslations("employees.toast")
  // isLoading starts true so the initial render shows skeleton immediately
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [tick, setTick] = useState(0)

  // setState calls inside the async .then() are fine — they happen in callbacks,
  // not synchronously in the effect body (satisfies react-hooks/set-state-in-effect)
  useEffect(() => {
    getEmployees({ page, pageSize: PAGE_SIZE, search }).then(({ data, error }) => {
      if (error) {
        toast.error(error.message)
      } else if (data) {
        setEmployees(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        // The server clamps an out-of-range page (see mock-data.ts's
        // safePage) — e.g. deleting the last row of the last page shrinks
        // totalPages below the still-stale `page` we requested. Sync back
        // to what the server actually returned so pagination/STT don't go
        // stale; this re-triggers the effect once more at the corrected page.
        if (data.page !== page) setPage(data.page)
      }
      setIsLoading(false)
    })
  }, [page, search, tick])

  // refresh() sets isLoading from an event handler context — not inside an effect body
  const refresh = useCallback(() => {
    setIsLoading(true)
    setTick((t) => t + 1)
  }, [])

  // A stale page number could point past the newly-filtered result set, so
  // every search change jumps back to page 1 — two plain setState calls in
  // an event handler, not an effect, so there's nothing to satisfy re: lint.
  const updateSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  async function handleCreate(input: CreateEmployeeInput) {
    const { error } = await createEmployee(input)
    if (error) {
      toast.error(error.message)
      return false
    }
    // Server-paginated — the new row may or may not land on the current
    // page/filter, so refetch rather than guess where to splice it locally.
    refresh()
    toast.success(t("createSuccess"))
    return true
  }

  async function handleUpdate(id: string, input: UpdateEmployeeInput) {
    const { data, error } = await updateEmployee(id, input)
    if (error) {
      toast.error(error.message)
      return false
    }
    setEmployees((prev) => prev.map((e) => (e.id === id ? data : e)))
    toast.success(t("updateSuccess"))
    return true
  }

  async function handleDelete(id: string) {
    const { error } = await deleteEmployee(id)
    if (error) {
      toast.error(error.message)
      return false
    }
    // Deleting can shrink the current page below its size (or empty it out
    // entirely) — refetch so page/total/totalPages all stay consistent.
    refresh()
    toast.success(t("deleteSuccess"))
    return true
  }

  async function handleDeleteMany(ids: string[]) {
    const results = await Promise.all(ids.map((id) => deleteEmployee(id)))
    const failedCount = results.filter((r) => r.error).length

    refresh()

    if (failedCount > 0) {
      toast.error(t("deleteManyPartialFail", { failed: failedCount, total: ids.length }))
    } else {
      toast.success(t("deleteManySuccess", { count: ids.length }))
    }
    return failedCount === 0
  }

  return {
    employees,
    total,
    totalPages,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    search,
    setSearch: updateSearch,
    isLoading,
    refresh,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleDeleteMany,
  }
}
