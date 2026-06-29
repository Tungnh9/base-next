import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("login") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">{t("login")}</h1>
        <LoginForm />
      </div>
    </div>
  );
}
