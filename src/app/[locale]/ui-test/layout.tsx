import type { ReactNode } from "react"
import { UiTestNav } from "./_nav"

export default function UiTestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <UiTestNav />
      <main className="p-8 max-w-3xl">
        {children}
      </main>
    </div>
  )
}
