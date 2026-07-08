"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ROUTES } from "@/lib/constants"
import { useForgotPasswordAction } from "../hooks/use-auth"
import { createForgotPasswordSchema } from "../schemas"

type ForgotPasswordFormInput = { email: string }

export function ForgotPasswordForm() {
  const tAuth = useTranslations("auth")
  const tVal = useTranslations("validation")
  const locale = useLocale()
  const router = useRouter()
  const { state, action, isPending } = useForgotPasswordAction()
  const [submittedEmail, setSubmittedEmail] = useState("")

  const form = useForm<ForgotPasswordFormInput>({
    resolver: zodResolver(createForgotPasswordSchema(tVal)),
    defaultValues: { email: "" },
  })

  useEffect(() => {
    if (state.requiresEmailVerification) {
      router.push(
        `/${locale}${ROUTES.forgotPasswordVerify}?email=${encodeURIComponent(submittedEmail)}`
      )
    } else if (state.error) {
      toast.error(tAuth(state.error))
    }
  }, [state, locale, router, submittedEmail, tAuth])

  function onSubmit(data: ForgotPasswordFormInput) {
    setSubmittedEmail(data.email)
    const fd = new FormData()
    fd.set("email", data.email)
    action(fd)
  }

  if (state.success) {
    return (
      <div className="space-y-4">
        <div className="bg-primary/10 text-primary rounded-md px-4 py-3 text-sm">
          {tAuth("forgotPasswordSuccess")}
        </div>
        <div className="flex justify-center">
          <Link
            href={`/${locale}${ROUTES.login}`}
            className="text-primary inline-flex items-center gap-1 text-[15px] hover:underline"
          >
            <ChevronLeft className="size-4" />
            {tAuth("backToLogin")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground text-[13px] font-normal">
                {tAuth("email")}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={tAuth("emailOrUsernamePlaceholder")}
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-1 w-full" disabled={isPending}>
          {isPending ? tAuth("sendResetLinkLoading") : tAuth("sendResetLink")}
        </Button>

        <div className="flex justify-center">
          <Link
            href={`/${locale}${ROUTES.login}`}
            className="text-primary inline-flex items-center gap-1 text-[15px] hover:underline"
          >
            <ChevronLeft className="size-4" />
            {tAuth("backToLogin")}
          </Link>
        </div>
      </form>
    </Form>
  )
}
