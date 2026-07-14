"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function BackButton({ label }: { label: string }) {
  const router = useRouter()
  return (
    <Button className="relative z-10 mt-6" onClick={() => router.back()}>
      {label}
    </Button>
  )
}
