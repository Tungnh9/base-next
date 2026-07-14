import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { FIELD_SIZE, FIELD_VALIDATION_CLASSES } from "@/lib/field-variants"

const textareaVariants = cva(
  cn(
    "w-full min-w-0 field-sizing-content resize-y border border-input bg-card outline-none transition-[color,box-shadow,background-color] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground read-only:bg-foreground/[0.08] disabled:cursor-not-allowed disabled:opacity-50 disabled:resize-none",
    FIELD_VALIDATION_CLASSES
  ),
  {
    variants: {
      size: {
        // Figma Small: py=7px, line-height=21px
        sm: cn(FIELD_SIZE.sm.radius, FIELD_SIZE.sm.px, FIELD_SIZE.sm.text, "min-h-[70px] py-[7px] leading-[21px]"),
        // Figma Default: py=9px, line-height=24px
        default: cn(FIELD_SIZE.default.radius, FIELD_SIZE.default.px, FIELD_SIZE.default.text, "min-h-[84px] py-[9px] leading-[24px]"),
        // Figma Large: py=12px, line-height=22px
        lg: cn(FIELD_SIZE.lg.radius, FIELD_SIZE.lg.px, FIELD_SIZE.lg.text, "min-h-[104px] py-3 leading-[22px]"),
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type TextareaProps = Omit<React.ComponentProps<"textarea">, "size"> &
  VariantProps<typeof textareaVariants> & {
    isValid?: boolean
  }

function Textarea({
  className,
  size = "default",
  isValid,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps) {
  const dataValid = isValid === undefined ? undefined : String(isValid)

  return (
    <textarea
      data-slot="textarea"
      data-valid={dataValid}
      aria-invalid={ariaInvalid}
      className={cn(textareaVariants({ size }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
export type { TextareaProps }
