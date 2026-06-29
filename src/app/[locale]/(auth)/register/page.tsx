import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("register") };
}

export default async function RegisterPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Đăng ký</h1>
      </div>
    </div>
  );
}
