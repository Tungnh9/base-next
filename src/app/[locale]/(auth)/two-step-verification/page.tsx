import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { AuthCardHeader } from "@/components/common/auth-card-header"
import { TwoStepForm } from "@/features/auth/components/two-step-form"
import { maskPhone } from "@/features/auth/utils"

type Props = {
  searchParams: Promise<{ phone?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return { title: `${t("twoStepVerification")} — ${t("siteName")}` }
}

export default async function TwoStepVerificationPage({ searchParams }: Props) {
  const t = await getTranslations("auth")
  const { phone = "" } = await searchParams
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "App"

  const maskedPhone = maskPhone(phone)

  return (
    <div className="border-primary/25 bg-card relative z-10 flex w-full max-w-[450px] flex-col gap-6 rounded-md border-2 border-dashed p-8">
      <AuthCardHeader appName={appName} />

      <div className="flex flex-col gap-[26px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-foreground text-[22px] leading-[30px] font-semibold">
            {t("twoStepTitle")}
          </h1>
          <p className="text-muted-foreground text-[15px] leading-[22px]">{t("twoStepSubtitle")}</p>
          <p className="text-foreground text-[15px] font-medium tracking-widest">{maskedPhone}</p>
        </div>

        <TwoStepForm />
      </div>
    </div>
  )
}
