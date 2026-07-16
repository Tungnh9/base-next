"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, CheckCircle2, Eye, EyeOff, Lightbulb } from "lucide-react"
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
import { useResetPasswordAction } from "../hooks/use-auth"
import { createResetPasswordSchema, type ResetPasswordFormInput } from "../schemas"
import { PasswordStrengthMeter } from "./password-strength-meter"

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const tAuth = useTranslations("auth")
  const tVal = useTranslations("validation")
  const locale = useLocale()
  const router = useRouter()
  const { state, action, isPending } = useResetPasswordAction()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(createResetPasswordSchema(tVal)),
    defaultValues: { password: "", confirmPassword: "" },
  })
  const password = useWatch({ control: form.control, name: "password" })
  const confirmPassword = useWatch({ control: form.control, name: "confirmPassword" })
  const confirmPasswordMatches = confirmPassword.length > 0 && confirmPassword === password

  useEffect(() => {
    if (state.success) {
      toast.success(tAuth("resetPasswordSuccess"))
      router.push(`/${locale}${ROUTES.login}`)
    }
  }, [state, locale, router, tAuth])

  function onSubmit(data: ResetPasswordFormInput) {
    const fd = new FormData()
    fd.set("password", data.password)
    fd.set("confirmPassword", data.confirmPassword)
    fd.set("token", token)
    action(fd)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground text-[13px] font-normal">
                {tAuth("newPassword")}
              </FormLabel>
              <FormControl>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  autoComplete="new-password"
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? tAuth("hidePassword") : tAuth("showPassword")}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PasswordStrengthMeter password={password} />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground text-[13px] font-normal">
                {tAuth("confirmPassword")}
              </FormLabel>
              <FormControl>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••"
                  autoComplete="new-password"
                  isValid={confirmPasswordMatches}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword ? tAuth("hidePassword") : tAuth("showPassword")
                      }
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  {...field}
                />
              </FormControl>
              {confirmPasswordMatches && (
                <p className="text-success flex items-center gap-1 text-[13px]">
                  <CheckCircle2 className="size-3.5" />
                  {tAuth("passwordConfirmMatch")}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {state.error && <p className="text-destructive text-sm">{tAuth(state.error)}</p>}

        <Button type="submit" className="mt-1 w-full" disabled={isPending}>
          {isPending ? tAuth("resetPasswordLoading") : tAuth("setNewPassword")}
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

        <div className="bg-info/10 flex items-start gap-2 rounded-md p-3">
          <Lightbulb className="text-info mt-0.5 size-4 shrink-0" />
          <p className="text-muted-foreground text-[13px]">
            <span className="text-foreground font-medium">{tAuth("securityTipTitle")}: </span>
            {tAuth("securityTipBody")}
          </p>
        </div>
      </form>
    </Form>
  )
}
