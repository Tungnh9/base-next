"use client"

import { useEffect, useState } from "react"
import { getEmployeeOptions } from "../actions"
import type { EmployeeOption } from "../types"

// Module-scope cache + in-flight dedupe. The picker is mounted by every
// CustomerForm instance (list page and detail page), and the option list is
// small, static-ish reference data — refetching it on each client-side
// navigation would be pure waste. Cache lives for the SPA session, so an
// employee added in another tab won't appear until a full reload; acceptable
// for a picker, and the tradeoff is worth stating out loud.
let cache: EmployeeOption[] | null = null
let inFlight: Promise<EmployeeOption[]> | null = null

function load(): Promise<EmployeeOption[]> {
  if (cache) return Promise.resolve(cache)
  if (!inFlight) {
    inFlight = getEmployeeOptions()
      .then(({ data, error }) => {
        // Only a successful fetch is cached. On error, resolve this call to
        // an empty list but leave `cache` at null so the NEXT mount retries
        // instead of every future picker permanently reusing an empty
        // result from one transient failure.
        if (error) return []
        cache = data ?? []
        return cache
      })
      .finally(() => {
        inFlight = null
      })
  }
  return inFlight
}

export function useEmployeeOptions() {
  const [options, setOptions] = useState<EmployeeOption[]>(cache ?? [])
  const [isLoading, setIsLoading] = useState(cache === null)

  // setState happens in the promise callback, not synchronously in the effect
  // body — same shape as useCustomers/useEmployees (satisfies
  // react-hooks/set-state-in-effect).
  useEffect(() => {
    let active = true
    load().then((loaded) => {
      if (!active) return
      setOptions(loaded)
      setIsLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return { options, isLoading }
}
