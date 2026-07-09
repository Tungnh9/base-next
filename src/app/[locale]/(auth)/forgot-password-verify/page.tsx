import Image from "next/image"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { ForgotPasswordVerifyForm } from "@/features/auth/components/forgot-password-verify-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth")
  return { title: t("forgotPasswordVerifyTitle") }
}

type Props = {
  searchParams: Promise<{ email?: string }>
}

export default async function ForgotPasswordVerifyPage({ searchParams }: Props) {
  const t = await getTranslations("auth")
  const { email = "" } = await searchParams
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "App"

  return (
    <div className="relative z-10 flex w-full max-w-[450px] flex-col gap-6 rounded-md bg-white p-8 shadow-[0px_4px_9px_rgba(75,70,92,0.1)]">
      <div className="flex items-center justify-center gap-2.5 py-2.5">
        <Image src="/logo.svg" alt={appName} width={30} height={30} className="h-[30px] w-[30px]" />
        <span className="text-foreground text-[26px] leading-[36px] font-bold">{appName}</span>
      </div>

      <div className="flex flex-col gap-[26px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-foreground text-[22px] leading-[30px] font-semibold">
            {t("forgotPasswordVerifyTitle")}
          </h1>
          <p className="text-muted-foreground text-[15px] leading-[22px]">
            {t("forgotPasswordVerifySubtitle")}
          </p>
          {email && <p className="text-foreground text-[15px] font-medium">{email}</p>}
        </div>

        <ForgotPasswordVerifyForm email={email} />
      </div>
    </div>
  )
}
