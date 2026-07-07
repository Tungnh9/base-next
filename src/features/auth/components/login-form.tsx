"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ROUTES } from "@/lib/constants"
import { useLoginAction } from "../hooks/use-auth"
import { createLoginSchema, type LoginInput } from "../schemas"

export function LoginForm() {
  const tAuth = useTranslations("auth")
  const tVal = useTranslations("validation")
  const { state, action, isPending } = useLoginAction()
  const [rememberMe, setRememberMe] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(createLoginSchema(tVal)),
    defaultValues: { email: "", password: "" },
  })

  function onSubmit(data: LoginInput) {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.set(k, String(v)))
    if (rememberMe) fd.set("rememberMe", "true")
    action(fd)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="gap-1">
              <FormLabel className="text-[13px] font-normal text-[#5d596c]">
                {tAuth("emailOrUsername")}
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="gap-1">
              <div className="flex items-center justify-between">
                <FormLabel className="text-[13px] font-normal text-[#5d596c]">
                  {tAuth("password")}
                </FormLabel>
                <Link
                  href={ROUTES.forgotPassword}
                  className="text-primary text-[13px] hover:underline"
                >
                  {tAuth("forgotPassword")}
                </Link>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-1.5">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <label
            htmlFor="remember-me"
            className="cursor-pointer text-[15px] text-[var(--text-body)] select-none"
          >
            {tAuth("rememberMe")}
          </label>
        </div>

        {state.error && <p className="text-destructive text-sm">{tAuth(state.error as never)}</p>}

        <Button type="submit" className="mt-1 w-full" disabled={isPending}>
          {isPending ? tAuth("loading") : tAuth("login")}
        </Button>

        <p className="text-center text-[15px] leading-[22px] text-[var(--text-body)]">
          {tAuth("newOnPlatform")}{" "}
          <Link href={ROUTES.register} className="text-primary hover:underline">
            {tAuth("createAccount")}
          </Link>
        </p>
      </form>
    </Form>
  )
}
