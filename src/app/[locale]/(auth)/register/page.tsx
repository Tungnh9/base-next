import Image from "next/image"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { AuthCard } from "@/components/common/auth-card"
import { AuthCardHeader } from "@/components/common/auth-card-header"
import { RegisterForm } from "@/features/auth/components/register-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return { title: `${t("register")} — ${t("siteName")}` }
}

export default async function RegisterPage() {
  const t = await getTranslations("auth")
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "App"

  return (
    <AuthCard>
      <AuthCardHeader appName={appName} />

      <div className="flex flex-col gap-[26px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-foreground text-[22px] leading-[30px] font-semibold">
            {t("registerTitle")}
          </h1>
          <p className="text-muted-foreground text-[15px] leading-[22px]">
            {t("registerSubtitle")}
          </p>
        </div>

        <RegisterForm />

        <div className="flex items-center gap-[26px]">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-[13px] leading-[20px]">
            {t("orContinueWith")}
          </span>
          <div className="bg-border h-px flex-1" />
        </div>

        <div className="flex justify-center gap-2.5">
          <Image src="/icons/social-facebook.svg" alt="Facebook" width={38} height={38} />
          <Image src="/icons/social-twitter.svg" alt="Twitter" width={38} height={38} />
          <Image src="/icons/social-google.svg" alt="Google" width={38} height={38} />
        </div>
      </div>
    </AuthCard>
  )
}
