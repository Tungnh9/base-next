"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
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
import { useLoginAction } from "../hooks/use-auth"
import { createLoginSchema, type LoginInput } from "../schemas"

export function LoginForm() {
  const tAuth = useTranslations("auth")
  const tVal = useTranslations("validation")
  const { state, action, isPending } = useLoginAction()
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<LoginInput>({
    resolver: zodResolver(createLoginSchema(tVal)),
    defaultValues: { email: "", password: "" },
  })

  useEffect(() => {
    if (state.error) {
      toast.error(tAuth(state.error))
    }
  }, [state.error, state, tAuth])

  function onSubmit(data: LoginInput) {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.set(k, String(v)))
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    autoComplete="current-password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 flex items-center"
                    tabIndex={-1}
                    aria-label={showPassword ? tAuth("hidePassword") : tAuth("showPassword")}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
