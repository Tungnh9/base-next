"use client"

import { useActionState } from "react"
import {
  loginAction,
  registerAction,
  forgotPasswordAction,
  verifyForgotPasswordCodeAction,
  resetPasswordAction,
  twoStepVerificationAction,
  resendVerificationEmailAction,
  resendTwoStepCodeAction,
  type ActionState,
} from "../actions"

const initialState: ActionState = {}

export function useLoginAction() {
  const [state, action, isPending] = useActionState(loginAction, initialState)
  return { state, action, isPending }
}

export function useRegisterAction() {
  const [state, action, isPending] = useActionState(registerAction, initialState)
  return { state, action, isPending }
}

export function useForgotPasswordAction() {
  const [state, action, isPending] = useActionState(forgotPasswordAction, initialState)
  return { state, action, isPending }
}

export function useForgotPasswordVerifyAction() {
  const [state, action, isPending] = useActionState(verifyForgotPasswordCodeAction, initialState)
  return { state, action, isPending }
}

export function useResetPasswordAction() {
  const [state, action, isPending] = useActionState(resetPasswordAction, initialState)
  return { state, action, isPending }
}

export function useTwoStepVerificationAction() {
  const [state, action, isPending] = useActionState(twoStepVerificationAction, initialState)
  return { state, action, isPending }
}

export function useResendVerificationEmailAction() {
  const [state, action, isPending] = useActionState(resendVerificationEmailAction, initialState)
  return { state, action, isPending }
}

export function useResendTwoStepAction() {
  const [state, action, isPending] = useActionState(resendTwoStepCodeAction, initialState)
  return { state, action, isPending }
}
