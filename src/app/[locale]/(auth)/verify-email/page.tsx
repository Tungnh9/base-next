import Image from "next/image"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { skipVerificationAction } from "@/features/auth/actions"
import { VerifyEmailResend } from "@/features/auth/components/verify-email-resend"

type Props = {
  searchParams: Promise<{ email?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return { title: `${t("verifyEmail")} — ${t("siteName")}` }
}

export default async function VerifyEmailPage({ searchParams }: Props) {
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
            {t("verifyEmailTitle")}
          </h1>
          <p className="text-muted-foreground text-[15px] leading-[22px]">
            {t("verifyEmailDesc")}{" "}
            {email && <span className="text-foreground font-medium">{email}</span>}
            {". "}
            {t("verifyEmailDescContinue")}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <form action={skipVerificationAction}>
            <Button type="submit" className="w-full">
              {t("skipForNow")}
            </Button>
          </form>

          <VerifyEmailResend email={email} />
        </div>
      </div>
    </div>
  )
}
