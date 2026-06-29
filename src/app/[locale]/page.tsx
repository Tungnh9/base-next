import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("nav");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background font-sans">
      <h1 className="text-2xl font-bold">{t("home")}</h1>
    </div>
  );
}
