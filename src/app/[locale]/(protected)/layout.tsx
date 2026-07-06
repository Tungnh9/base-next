import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Footer } from "@/components/layout/footer"

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect(ROUTES.login)
  }

  return (
    <div className="bg-background flex min-h-dvh gap-[26px] pr-[26px]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-[26px] pt-4">
        <Header />
        <main className="flex-1 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
