import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { BackButton } from "@/components/common/back-button"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("notAuthorized")} — ${t("siteName")}` }
}

export default async function NotAuthorizedPage() {
  const [t, tCommon] = await Promise.all([
    getTranslations("misc.notAuthorized"),
    getTranslations("common"),
  ])

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden pt-[100px]">
      <Image
        src="/icons/shape-light.svg"
        alt=""
        aria-hidden
        width={1440}
        height={352}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-auto w-full dark:hidden"
      />
      <Image
        src="/icons/shape-dark.svg"
        alt=""
        aria-hidden
        width={1440}
        height={352}
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-auto w-full dark:block"
      />

      <div className="relative z-10 flex flex-col items-center gap-[6px] text-center">
        <h1 className="text-[32px] leading-[44px] font-semibold text-[#5d596c]">{t("title")}</h1>
        <p className="max-w-md text-[15px] leading-[22px] text-[var(--text-body)]">
          {t("subtitle")}
        </p>
      </div>
      <BackButton label={tCommon("back")} />
      <Image
        src="/images/notify/you-are-not-authorized.png"
        alt=""
        aria-hidden
        width={171}
        height={500}
        priority
        className="relative z-10 mt-[80.5px]"
      />
    </div>
  )
}
