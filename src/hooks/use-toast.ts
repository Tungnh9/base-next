"use client"

import * as React from "react"

import type { ToastVariant } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 300

export type ToastType = "simple" | "rich"

export interface ToastOptions {
  id?: string
  type?: ToastType
  variant?: ToastVariant
  title?: React.ReactNode
  description?: React.ReactNode
  timestamp?: string
  action?: {
    label: string
    altText?: string
    onClick?: () => void
  }
  cancel?: {
    label: string
    onClick?: () => void
  }
  open?: boolean
  onOpenChange?: (open: boolean) => void
  duration?: number
}

export type ToasterToast = Required<Pick<ToastOptions, "id" | "open">> & ToastOptions

const ADD_TOAST    = "ADD_TOAST"    as const
const UPDATE_TOAST = "UPDATE_TOAST" as const
const DISMISS_TOAST = "DISMISS_TOAST" as const
const REMOVE_TOAST  = "REMOVE_TOAST"  as const

type Action =
  | { type: typeof ADD_TOAST; toast: ToasterToast }
  | { type: typeof UPDATE_TOAST; toast: Partial<ToasterToast> & { id: string } }
  | { type: typeof DISMISS_TOAST; toastId?: string }
  | { type: typeof REMOVE_TOAST; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  // Clear any existing timeout so dismiss() after update({open:true}) always reschedules
  const existing = toastTimeouts.get(toastId)
  if (existing !== undefined) {
    clearTimeout(existing)
    toastTimeouts.delete(toastId)
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: REMOVE_TOAST, toastId })
  }, TOAST_REMOVE_DELAY)
  toastTimeouts.set(toastId, timeout)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ADD_TOAST:
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }
    case UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    case DISMISS_TOAST: {
      const { toastId } = action
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((t) => addToRemoveQueue(t.id))
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          !toastId || t.id === toastId ? { ...t, open: false } : t
        ),
      }
    }
    case REMOVE_TOAST:
      return {
        ...state,
        toasts: action.toastId
          ? state.toasts.filter((t) => t.id !== action.toastId)
          : [],
      }
  }
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  // Iterate over a snapshot so a listener that throws doesn't silently drop subsequent ones
  listeners.slice().forEach((l) => {
    try { l(memoryState) } catch {}
  })
}

let count = 0
function genId(): string {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

function toast(options: Omit<ToastOptions, "id">) {
  const id = genId()

  const update  = (o: Partial<ToastOptions>) => dispatch({ type: UPDATE_TOAST,  toast: { ...o, id } })
  const dismiss = () => dispatch({ type: DISMISS_TOAST, toastId: id })

  dispatch({
    type: ADD_TOAST,
    toast: {
      ...options,
      id,
      type:    options.type    ?? "simple",
      variant: options.variant ?? "default",
      open: true,
      onOpenChange: (open) => { options.onOpenChange?.(open); if (!open) dismiss() },
    },
  })

  return { id, update, dismiss }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    // Sync any dispatches that fired between render and this effect
    setState(memoryState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: DISMISS_TOAST, toastId }),
  }
}

export { toast, useToast }
