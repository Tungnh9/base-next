"use client"

import { useEffect, useState } from "react"
import { getCustomerOptions } from "../actions"
import type { CustomerOption } from "../types"

// Module-scope cache + in-flight dedupe — mirrors use-employee-options.ts.
// The picker is mounted by every Sales Opportunities filter bar/table
// instance, and the option list is small, static-ish reference data.
let cache: CustomerOption[] | null = null
let inFlight: Promise<CustomerOption[]> | null = null

function load(): Promise<CustomerOption[]> {
  if (cache) return Promise.resolve(cache)
  if (!inFlight) {
    inFlight = getCustomerOptions()
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

export function useCustomerOptions() {
  const [options, setOptions] = useState<CustomerOption[]>(cache ?? [])
  const [isLoading, setIsLoading] = useState(cache === null)

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
