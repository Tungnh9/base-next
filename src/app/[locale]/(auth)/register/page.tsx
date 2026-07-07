import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { RegisterForm } from "@/features/auth/components/register-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth")
  return { title: t("register") }
}

export default async function RegisterPage() {
  const t = await getTranslations("auth")

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center">{t("register")}</h1>
        <RegisterForm />
      </div>
    </div>
  )
}
