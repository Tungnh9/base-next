import Image from "next/image"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { ROUTES } from "@/lib/constants"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth")
  return { title: t("resetPassword") }
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
    <div className="relative z-10 flex w-full max-w-[450px] flex-col gap-6 rounded-md bg-white p-8 shadow-[0px_4px_9px_rgba(75,70,92,0.1)]">
      <div className="flex items-center justify-center gap-2.5 py-2.5">
        <Image src="/logo.svg" alt={appName} width={30} height={30} />
        <span className="text-foreground text-[26px] leading-[36px] font-bold">{appName}</span>
      </div>

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
    </div>
  )
}
