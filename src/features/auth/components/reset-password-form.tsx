"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, Eye, EyeOff } from "lucide-react"
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

interface ResetPasswordFormProps {
  token: string
  email?: string
}

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const tAuth = useTranslations("auth")
  const tVal = useTranslations("validation")
  const locale = useLocale()
  const { state, action, isPending } = useResetPasswordAction()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(createResetPasswordSchema(tVal)),
    defaultValues: { password: "", confirmPassword: "" },
  })

  function onSubmit(data: ResetPasswordFormInput) {
    const fd = new FormData()
    fd.set("password", data.password)
    fd.set("confirmPassword", data.confirmPassword)
    fd.set("token", token)
    fd.set("email", email ?? "")
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
      </form>
    </Form>
  )
}
