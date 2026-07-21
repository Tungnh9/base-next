"use client"

import { useCallback } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { logoutAction } from "@/features/auth/actions"
import { useUserStore } from "@/stores"
import { useSessionExpiryWarning } from "../hooks/use-session-expiry"

interface SessionExpiryToastProps {
  exp: number | undefined
}

// Renders nothing — purely wires the session-expiry hook to a toast
// notification. Not a token refresh mechanism: there is no refresh endpoint
// on the backend, so the only options when the session is about to expire
// are to let it lapse (silent logout on next navigation, enforced by
// proxy.ts/the protected layout guard) or log out proactively via the
// action button below. See docs/auth.md.
export function SessionExpiryToast({ exp }: SessionExpiryToastProps) {
  const t = useTranslations("sessionExpiry")
  const tAuth = useTranslations("auth")
  const clearUser = useUserStore((s) => s.clearUser)

  const handleExpiringSoon = useCallback(() => {
    toast.warning(t("title"), {
      description: t("description"),
      action: {
        label: t("logoutNow"),
        onClick: () => {
          // Mirrors UserMenu's logout item exactly: clear the client store
          // first, then call the server action to clear the session cookie
          // and redirect.
          clearUser()
          toast.success(tAuth("logoutSuccess"))
          logoutAction()
        },
      },
    })
  }, [t, tAuth, clearUser])

  useSessionExpiryWarning(exp, handleExpiringSoon)

  return null
}
