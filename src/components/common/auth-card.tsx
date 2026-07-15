import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AuthCardProps {
  children: ReactNode
  className?: string
}

// Shared card shell for the (auth) pages — login/register/forgot-password/etc.
// two-step-verification intentionally does NOT use this: it has its own
// dashed-border treatment instead of the drop shadow used everywhere else.
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "bg-card relative z-10 flex w-full max-w-[450px] flex-col gap-6 rounded-md p-8 shadow-[0px_4px_9px_rgba(75,70,92,0.1)] dark:shadow-[0px_4px_20px_rgba(15,20,34,0.4)]",
        className
      )}
    >
      {children}
    </div>
  )
}
