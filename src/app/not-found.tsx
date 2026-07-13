import Image from "next/image"
import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"

export default async function NotFound() {
  const [locale, t, session] = await Promise.all([
    getLocale(),
    getTranslations("errors"),
    getSession(),
  ])

  const homeHref = session
    ? `/${locale}${ROUTES.dashboard}`
    : `/${locale}${ROUTES.login}`

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden pt-[100px]">
      {/* Decorative "stage" behind the illustration — natural aspect ratio, full width */}
      <Image
        src="/icons/shape.svg"
        alt=""
        aria-hidden
        width={1440}
        height={352}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-auto w-full"
      />

      <div className="relative z-10 flex flex-col items-center gap-[6px] text-center">
        <h1 className="text-[32px] leading-[44px] font-semibold text-[#5d596c]">
          {t("notFoundTitle")}
        </h1>
        <p className="text-[15px] leading-[22px] text-[var(--text-body)]">
          {t("notFoundDescription")}
        </p>
      </div>
      <Button asChild className="relative z-10 mt-6">
        <Link href={homeHref}>{t("backToHome")}</Link>
      </Button>
      <Image
        src="/images/notify/error.png"
        alt={t("notFoundTitle")}
        width={220}
        height={488}
        priority
        className="relative z-10 mt-[80.5px]"
      />
    </div>
  )
}
