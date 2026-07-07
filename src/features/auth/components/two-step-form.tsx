"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { OtpInput } from "./otp-input"
import { useTwoStepVerificationAction, useResendTwoStepAction } from "../hooks/use-auth"

export function TwoStepForm() {
  const tAuth = useTranslations("auth")
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const { state, action, isPending } = useTwoStepVerificationAction()
  const {
    state: resendState,
    action: resendAction,
    isPending: isResending,
  } = useResendTwoStepAction()

  const isCodeComplete = digits.every(Boolean)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set("code", digits.join(""))
    action(fd)
  }

  function handleResend() {
    resendAction(new FormData())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <p className="text-muted-foreground text-[13px]">{tAuth("typeSecurityCode")}</p>
        <OtpInput value={digits} onChange={setDigits} />
      </div>

      {state.error && <p className="text-destructive text-sm">{tAuth(state.error)}</p>}

      <Button type="submit" className="mt-1 w-full" disabled={isPending || !isCodeComplete}>
        {isPending ? tAuth("verifyingAccount") : tAuth("verifyMyAccount")}
      </Button>

      <p className="text-center text-[15px] text-[var(--text-body)]">
        {tAuth("didntGetCode")}{" "}
        {resendState.success ? (
          <span className="text-primary text-sm">{tAuth("resendCodeSuccess")}</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary hover:underline disabled:opacity-50"
          >
            {tAuth("resend")}
          </button>
        )}
      </p>
    </form>
  )
}
