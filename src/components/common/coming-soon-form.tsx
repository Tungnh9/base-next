"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { BackButton } from "./back-button"

interface ComingSoonFormProps {
  backLabel: string
  successToast: string
}

export function ComingSoonForm({ backLabel, successToast }: ComingSoonFormProps) {
  const t = useTranslations("misc.comingSoon")
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleNotify(e: React.FormEvent) {
    e.preventDefault()
    toast.success(successToast)
    setSubmitted(true)
  }

  if (submitted) {
    return <BackButton label={backLabel} />
  }

  return (
    <form
      onSubmit={handleNotify}
      className="relative z-10 mt-6 flex rounded-md shadow-[0px_2px_4px_rgba(165,163,174,0.3)]"
    >
      <input
        type="email"
        placeholder={t("emailPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="text-foreground w-[217px] rounded-l-md border border-r-0 border-[#dbdade] bg-white px-[14px] py-[7px] text-[15px] leading-6 outline-none placeholder:text-[#b7b5be] dark:border-[#444158] dark:bg-[#2f2b3d]"
      />
      <button
        type="submit"
        className="rounded-r-md bg-[#7367f0] px-5 py-[10px] text-[15px] font-medium tracking-[0.43px] text-white transition-opacity hover:opacity-90"
      >
        {t("action")}
      </button>
    </form>
  )
}
