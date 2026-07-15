import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { AuthCard } from "@/components/common/auth-card"
import { AuthCardHeader } from "@/components/common/auth-card-header"
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
    <AuthCard>
      <AuthCardHeader appName={appName} />

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
    </AuthCard>
  )
}
