import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Footer } from "@/components/layout/footer"
import { ScrollArea } from "@/components/layout/scroll-area"
import { SessionExpiryToast } from "@/features/auth/components/session-expiry-toast"

interface ProtectedLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
  const [session, { locale }] = await Promise.all([getSession(), params])

  if (!session) {
    redirect(`/${locale}${ROUTES.login}`)
  }

  return (
    // Fixed-height shell (h-dvh, not min-h-dvh) + overflow-hidden: nothing
    // here scrolls except <main>'s own ScrollArea. Header and Footer sit
    // outside the scrolling region entirely — always in place, never
    // affected by scroll position — so they can't be clipped by or
    // rendered under by page content the way they could when the sidebar
    // had to track a sticky position against a taller scrolling sibling.
    <div className="bg-background flex h-dvh gap-[26px] overflow-hidden pr-[26px]">
      <Sidebar role={session.role} />
      <div className="flex min-w-0 flex-1 flex-col gap-[26px] pt-4">
        <Header />
        <SessionExpiryToast exp={session.exp} />
        <main className="min-h-0 flex-1">
          <ScrollArea className="h-full">{children}</ScrollArea>
        </main>
        <Footer />
      </div>
    </div>
  )
}
