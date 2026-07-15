"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  label: string
  className?: string
}

export function BackButton({ label, className }: BackButtonProps) {
  const router = useRouter()
  return (
    <Button className={cn("relative z-10 mt-6", className)} onClick={() => router.back()}>
      {label}
    </Button>
  )
}
