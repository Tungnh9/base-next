import Image from "next/image"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { TwoStepForm } from "@/features/auth/components/two-step-form"

type Props = {
  searchParams: Promise<{ phone?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth")
  return { title: t("twoStepTitle") }
}

export default async function TwoStepVerificationPage({ searchParams }: Props) {
  const t = await getTranslations("auth")
  const { phone = "" } = await searchParams
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "App"

  // Mask phone: keep last 4 digits, replace the rest with ⁎
  const maskedPhone = phone
    ? "⁎".repeat(Math.max(0, phone.length - 4)) + phone.slice(-4)
    : "⁎⁎⁎⁎⁎⁎9763"

  return (
    <div className="border-primary/25 relative z-10 flex w-full max-w-[450px] flex-col gap-6 rounded-md border-2 border-dashed bg-white p-8">
      <div className="flex items-center justify-center gap-2.5 py-2.5">
        <Image src="/logo.svg" alt={appName} width={30} height={30} className="h-[30px] w-[30px]" />
        <span className="text-foreground text-[26px] leading-[36px] font-bold">{appName}</span>
      </div>

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
