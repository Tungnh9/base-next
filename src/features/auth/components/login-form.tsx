"use client"

import { useEffect, useState, startTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useUserStore } from "@/stores"
import { useLoginAction } from "../hooks/use-auth"
import { useCountdownMs } from "../hooks/use-countdown"
import { createLoginSchema, type LoginInput } from "../schemas"
import { formatCountdown } from "../utils"

function AnimatedEllipsis() {
  const [count, setCount] = useState(1)
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c % 3) + 1), 500)
    return () => clearInterval(id)
  }, [])
  // fixed width prevents layout shift as dot count changes
  return <span className="inline-block w-[18px] text-left">{".".repeat(count)}</span>
}

interface LockedSubmitButtonProps {
  retryAfterMs: number
  tAuth: (key: string, values?: Record<string, string>) => string
}

// Mounted fresh (via `key={state.retryAfterMs}` in the parent) each time a new
// lockout starts, so `Date.now()` is only ever read once — inside the useState
// lazy initializer — rather than synchronously during render or an effect body.
function LockedSubmitButton({ retryAfterMs, tAuth }: LockedSubmitButtonProps) {
  const [targetTimestamp] = useState(() => Date.now() + retryAfterMs)
  const remainingMs = useCountdownMs(targetTimestamp)
  const isLocked = remainingMs > 0

  return (
    <Button type="submit" className="mt-1 w-full" disabled={isLocked}>
      {isLocked ? tAuth("tryAgainIn", { time: formatCountdown(remainingMs) }) : tAuth("login")}
    </Button>
  )
}

export function LoginForm() {
  const tAuth = useTranslations("auth")
  const tVal = useTranslations("validation")
  const locale = useLocale()
  const router = useRouter()
  const { state, action, isPending } = useLoginAction()
  const setUser = useUserStore((s) => s.setUser)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  // Latch: set true on submit, stays true until navigation (unmount) or error (state.error resets derived value)
  const [isNavigating, setIsNavigating] = useState(false)
  const showLoading = isPending || (isNavigating && !state.error)
  const retryAfterMs = state.error === "tooManyAttempts" ? state.retryAfterMs : undefined

  const form = useForm<LoginInput>({
    resolver: zodResolver(createLoginSchema(tVal)),
    defaultValues: { email: "", password: "" },
  })

  useEffect(() => {
    if (state.success) {
      if (state.user) setUser(state.user)
      toast.success(tAuth("loginSuccess"))
      router.push(`/${locale}${ROUTES.dashboard}`)
    } else if (state.requiresTwoFactor) {
      const phone = state.twoFactorPhone ? `?phone=${encodeURIComponent(state.twoFactorPhone)}` : ""
      router.push(`/${locale}${ROUTES.twoStepVerification}${phone}`)
    } else if (state.error) {
      toast.error(tAuth(state.error))
    }
  }, [state, locale, router, tAuth, setUser])

  function onSubmit(data: LoginInput) {
    setIsNavigating(true)
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.set(k, String(v)))
    startTransition(() => action(fd))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="gap-1">
              <FormLabel className="text-foreground text-[13px] font-normal">
                {tAuth("emailOrUsername")}
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="gap-1">
              <div className="flex items-center justify-between">
                <FormLabel className="text-foreground text-[13px] font-normal">
                  {tAuth("password")}
                </FormLabel>
                <Link
                  href={`/${locale}${ROUTES.forgotPassword}`}
                  className="text-primary text-[13px] hover:underline"
                >
                  {tAuth("forgotPassword")}
                </Link>
              </div>
              <FormControl>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  autoComplete="current-password"
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

        <div className="flex items-center gap-1.5">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <label
            htmlFor="remember-me"
            className="text-muted-foreground cursor-pointer text-[15px] leading-[22px]"
          >
            {tAuth("rememberMe")}
          </label>
        </div>

        {retryAfterMs ? (
          <LockedSubmitButton key={retryAfterMs} retryAfterMs={retryAfterMs} tAuth={tAuth} />
        ) : (
          <Button type="submit" className="mt-1 w-full" disabled={showLoading}>
            {showLoading ? (
              <>
                {tAuth("loggingIn")}
                <AnimatedEllipsis />
              </>
            ) : (
              tAuth("login")
            )}
          </Button>
        )}

        <p className="text-center text-[15px] leading-[22px] text-[var(--text-body)]">
          {tAuth("newOnPlatform")}{" "}
          <Link href={`/${locale}${ROUTES.register}`} className="text-primary hover:underline">
            {tAuth("createAccount")}
          </Link>
        </p>
      </form>
    </Form>
  )
}
