import { getTranslations } from "next-intl/server"

export async function Footer() {
  const t = await getTranslations("footer")

  return (
    <footer className="flex shrink-0 items-center justify-center py-3">
      <div className="text-muted-foreground flex w-full flex-col items-center gap-2 text-center text-[15px] sm:flex-row sm:justify-between sm:text-left">
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground transition-colors">
            {t("license")}
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            {t("documentation")}
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            {t("support")}
          </a>
        </div>
      </div>
    </footer>
  )
}
