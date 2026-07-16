"use client"

import { useTranslations } from "next-intl"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PASSWORD_REQUIREMENTS,
  getPasswordStrength,
  type PasswordStrength,
  type PasswordRequirement,
} from "../utils"

interface PasswordStrengthMeterProps {
  password: string
}

// 3 segments, one per strength level — a segment's own color never changes
// once "reached"; only how many are lit up does. Neutral/unreached segments
// use `bg-border` (not `bg-muted`, which is nearly white in light mode and
// barely visible against the card background in either theme).
const STRENGTH_STYLES: Record<
  PasswordStrength,
  { barClass: string; textClass: string; labelKey: string }
> = {
  weak: {
    barClass: "bg-destructive",
    textClass: "text-destructive",
    labelKey: "passwordStrengthWeak",
  },
  medium: { barClass: "bg-warning", textClass: "text-warning", labelKey: "passwordStrengthMedium" },
  strong: { barClass: "bg-success", textClass: "text-success", labelKey: "passwordStrengthStrong" },
}

const STRENGTH_SEGMENTS: Record<PasswordStrength, number> = { weak: 1, medium: 2, strong: 3 }
const TOTAL_SEGMENTS = 3

const REQUIREMENT_LABEL_KEYS: Record<PasswordRequirement["key"], string> = {
  minLength: "passwordReqMinLength",
  uppercase: "passwordReqUppercase",
  lowercase: "passwordReqLowercase",
  digit: "passwordReqDigit",
  specialChar: "passwordReqSpecialChar",
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const tAuth = useTranslations("auth")
  const strength = getPasswordStrength(password)
  const style = STRENGTH_STYLES[strength]
  const filled = password ? STRENGTH_SEGMENTS[strength] : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="text-muted-foreground">{tAuth("passwordStrengthLabel")}</span>
        <span className={cn("font-medium", style.textClass)}>{tAuth(style.labelKey)}</span>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < filled ? style.barClass : "bg-border"
            )}
          />
        ))}
      </div>

      <ul className="space-y-1.5">
        {PASSWORD_REQUIREMENTS.map((req) => {
          const met = req.test(password)
          return (
            <li key={req.key} className="flex items-center gap-2">
              <CheckCircle2
                className={cn(
                  "size-4 shrink-0 transition-all duration-200",
                  met
                    ? "text-success scale-100 opacity-100"
                    : "text-muted-foreground/30 scale-90 opacity-70"
                )}
              />
              <span
                className={cn(
                  "text-[13px] transition-colors duration-200",
                  met ? "text-success" : "text-muted-foreground"
                )}
              >
                {tAuth(REQUIREMENT_LABEL_KEYS[req.key])}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
