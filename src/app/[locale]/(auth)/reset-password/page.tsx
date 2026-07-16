import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { AuthCard } from "@/components/common/auth-card"
import { AuthCardHeader } from "@/components/common/auth-card-header"
import { ROUTES } from "@/lib/constants"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return { title: `${t("resetPassword")} — ${t("siteName")}` }
}

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ email?: string; token?: string }>
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const [{ locale }, { email = "", token = "" }] = await Promise.all([params, searchParams])
  if (!token) {
    redirect(`/${locale}${ROUTES.forgotPassword}`)
  }
  const t = await getTranslations("auth")
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "App"

  return (
    <AuthCard>
      <AuthCardHeader appName={appName} />

      <div className="flex flex-col gap-[26px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-foreground text-[22px] leading-[30px] font-semibold">
            {t("resetPasswordTitle")}
          </h1>
          {email && (
            <p className="text-muted-foreground text-[15px] leading-[22px]">
              {t("resetPasswordFor")}{" "}
              <strong className="text-foreground font-medium">{email}</strong>
            </p>
          )}
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </AuthCard>
  )
}
