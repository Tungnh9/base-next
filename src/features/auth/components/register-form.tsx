"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
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
import { useRegisterAction } from "../hooks/use-auth"
import { createRegisterSchema, type RegisterFormInput } from "../schemas"

export function RegisterForm() {
  const tAuth = useTranslations("auth")
  const tVal = useTranslations("validation")
  const locale = useLocale()
  const router = useRouter()
  const { state, action, isPending } = useRegisterAction()
  const [showPassword, setShowPassword] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  useEffect(() => {
    if (state.success) {
      toast.success(tAuth("registerSuccess"))
      router.push(`/${locale}${ROUTES.verifyEmail}?email=${encodeURIComponent(submittedEmail)}`)
    } else if (state.error) {
      toast.error(tAuth(state.error))
    }
  }, [state, tAuth, locale, router, submittedEmail])

  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(createRegisterSchema(tVal)),
    defaultValues: { username: "", email: "", password: "", agreeToTerms: false },
  })

  function onSubmit(data: RegisterFormInput) {
    setSubmittedEmail(data.email)
    const fd = new FormData()
    fd.set("username", data.username)
    fd.set("email", data.email)
    fd.set("password", data.password)
    action(fd)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground text-[13px] font-normal">
                {tAuth("username")}
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={tAuth("usernamePlaceholder")}
                  autoComplete="username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  placeholder={tAuth("registerEmailPlaceholder")}
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground text-[13px] font-normal">
                {tAuth("password")}
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
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-1.5">
                <FormControl>
                  <Checkbox
                    id="agree-terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <label
                  htmlFor="agree-terms"
                  className="text-foreground cursor-pointer text-[15px] leading-5 select-none"
                >
                  {tAuth("agreeToPolicy")}{" "}
                  <Link href="#" className="text-primary hover:underline">
                    {tAuth("privacyPolicy")}
                  </Link>
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-1 w-full" disabled={isPending}>
          {isPending ? tAuth("registerLoading") : tAuth("signUp")}
        </Button>

        <p className="text-muted-foreground text-center text-[15px] leading-[22px]">
          {tAuth("alreadyHaveAccount")}{" "}
          <Link href={`/${locale}${ROUTES.login}`} className="text-primary hover:underline">
            {tAuth("signInInstead")}
          </Link>
        </p>
      </form>
    </Form>
  )
}
