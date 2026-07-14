"use client"

import { useTranslations } from "next-intl"
import { useResendVerificationEmailAction } from "../hooks/use-auth"

export function VerifyEmailResend({ email }: { email: string }) {
  const tAuth = useTranslations("auth")
  const { state, action, isPending } = useResendVerificationEmailAction()

  function handleResend() {
    const fd = new FormData()
    fd.set("email", email)
    action(fd)
  }

  return (
    <p className="text-center text-[15px] text-[var(--text-body)]">
      {tAuth("didntGetEmail")}{" "}
      {state.success ? (
        <span className="text-primary text-sm">{tAuth("resendSuccess")}</span>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={isPending}
          className="text-primary hover:underline disabled:opacity-50"
        >
          {tAuth("resend")}
        </button>
      )}
    </p>
  )
}
