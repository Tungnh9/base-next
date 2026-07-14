"use client"

import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { OtpInput } from "./otp-input"
import { ROUTES } from "@/lib/constants"
import { useUserStore } from "@/stores"
import { useTwoStepVerificationAction, useResendTwoStepAction } from "../hooks/use-auth"

export function TwoStepForm() {
  const tAuth = useTranslations("auth")
  const locale = useLocale()
  const router = useRouter()
  const setUser = useUserStore((s) => s.setUser)
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const { state, action, isPending } = useTwoStepVerificationAction()
  const {
    state: resendState,
    action: resendAction,
    isPending: isResending,
  } = useResendTwoStepAction()

  const isCodeComplete = digits.every(Boolean)

  useEffect(() => {
    if (state.success) {
      if (state.user) setUser(state.user)
      router.push(`/${locale}${ROUTES.dashboard}`)
    }
  }, [state, locale, router, setUser])

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
