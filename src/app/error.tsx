"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations("common")

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h2>{t("error")}</h2>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  )
}
