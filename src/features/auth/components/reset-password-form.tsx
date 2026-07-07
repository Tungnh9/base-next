"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft } from "lucide-react"
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
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const tAuth = useTranslations("auth")
  const tVal = useTranslations("validation")
  const { state, action, isPending } = useResetPasswordAction()

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(createResetPasswordSchema(tVal)),
    defaultValues: { password: "", confirmPassword: "" },
  })

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
                <Input type="password" autoComplete="new-password" {...field} />
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
                <Input type="password" autoComplete="new-password" {...field} />
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
            href={ROUTES.login}
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
