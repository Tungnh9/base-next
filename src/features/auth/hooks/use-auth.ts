"use client"

import { useActionState } from "react"
import { loginAction, registerAction, type ActionState } from "../actions"

const initialState: ActionState = {}

export function useLoginAction() {
  const [state, action, isPending] = useActionState(loginAction, initialState)
  return { state, action, isPending }
}

export function useRegisterAction() {
  const [state, action, isPending] = useActionState(registerAction, initialState)
  return { state, action, isPending }
}
