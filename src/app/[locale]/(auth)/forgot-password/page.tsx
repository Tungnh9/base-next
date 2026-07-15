import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { AuthCard } from "@/components/common/auth-card"
import { AuthCardHeader } from "@/components/common/auth-card-header"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return { title: `${t("forgotPassword")} — ${t("siteName")}` }
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth")
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "App"

  return (
    <AuthCard>
      <AuthCardHeader appName={appName} />

      <div className="flex flex-col gap-[26px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-foreground text-[22px] leading-[30px] font-semibold">
            {t("forgotPasswordTitle")}
          </h1>
          <p className="text-muted-foreground text-[15px] leading-[22px]">
            {t("forgotPasswordSubtitle")}
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </AuthCard>
  )
}
