import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("dashboard") };
}

export default async function DashboardPage() {
  const t = await getTranslations("nav");

  return (
    <div className="flex flex-col flex-1 p-6">
      <h1>{t("dashboard")}</h1>
    </div>
  );
}
