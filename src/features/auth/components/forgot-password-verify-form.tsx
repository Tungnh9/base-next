"use client"

import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { OtpInput } from "./otp-input"
import { ROUTES } from "@/lib/constants"
import { useForgotPasswordVerifyAction } from "../hooks/use-auth"

interface ForgotPasswordVerifyFormProps {
  email: string
}

export function ForgotPasswordVerifyForm({ email }: ForgotPasswordVerifyFormProps) {
  const tAuth = useTranslations("auth")
  const locale = useLocale()
  const router = useRouter()
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const { state, action, isPending } = useForgotPasswordVerifyAction()

  const isCodeComplete = digits.every(Boolean)

  useEffect(() => {
    if (state.success && state.resetToken) {
      router.push(
        `/${locale}${ROUTES.resetPassword}?token=${encodeURIComponent(state.resetToken)}&email=${encodeURIComponent(email)}`
      )
    } else if (state.error) {
      toast.error(tAuth(state.error))
    }
  }, [state, locale, router, email, tAuth])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set("email", email)
    fd.set("code", digits.join(""))
    action(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <p className="text-muted-foreground text-[13px]">{tAuth("typeSecurityCode")}</p>
        <OtpInput value={digits} onChange={setDigits} />
      </div>

      <Button type="submit" className="mt-1 w-full" disabled={isPending || !isCodeComplete}>
        {isPending ? tAuth("verifyingAccount") : tAuth("verifyMyAccount")}
      </Button>
    </form>
  )
}
