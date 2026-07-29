"use client"

import { useCallback } from "react"
import { useTranslations } from "next-intl"
import { useEmployeeOptions } from "./use-employee-options"

// Shared by every feature that stores an employee id and needs to render a
// name for it (customers' NVKD/QLHĐ columns, sales opportunities' NVKD
// column, etc.): a stored id whose employee has since been deleted should
// render as "Nhân viên #id", but a valid id must NOT be mislabeled that way
// just because useEmployeeOptions() is still loading — this returns
// undefined while loading so callers fall back to their own empty-state
// rendering ("—" etc.) instead.
//
// useCallback keeps the returned function's identity stable across renders
// (only changing when `options`/`isLoading` actually do) — callers depend on
// it inside a useMemo for column definitions, and a new-identity-every-render
// function would defeat that memoization.
export function useResolveEmployeeName() {
  const t = useTranslations("employees")
  const { options, isLoading } = useEmployeeOptions()

  return useCallback(
    (id?: string): string | undefined => {
      if (!id) return undefined
      if (isLoading) return undefined
      const match = options.find((option) => option.id === id)
      return match ? match.name : t("unknownEmployee", { id })
    },
    [t, options, isLoading]
  )
}
