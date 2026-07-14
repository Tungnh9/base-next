"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const DEFAULT_VARIANT = "select" as const

// Figma "Multiple Select/Default" & "Tagify/Default": h≈38px, radius=6px, px=8px, py=7px, gap=6px
const tagInputVariants = cva(
  "flex w-full min-w-0 flex-wrap items-center gap-1.5 rounded-[6px] border border-input bg-card px-2 py-[7px] outline-none transition-[color,box-shadow,background-color] focus-within:border-primary focus-within:shadow-[0px_2px_2px_rgba(165,163,174,0.3)] has-[input[aria-invalid=true]]:border-destructive has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
  {
    variants: {},
  }
)

// Figma chip: radius=4px, px=10px, py=5px, gap=6px, text=13px semibold
// Kept separate from Badge (src/components/ui/badge.tsx) rather than reusing it directly:
// Badge is rounded-full with a different padding scale and has no built-in remove affordance,
// neither of which fit the square Figma chip here.
const chipVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-[4px] px-[10px] py-[5px] text-[13px] font-semibold leading-[14px] whitespace-nowrap",
  {
    variants: {
      variant: {
        // Figma "Multiple Select": bg primary/16%, text primary
        select: "bg-primary/[0.16] text-primary",
        // Figma "Tagify": bg foreground/16%, text foreground
        tag: "bg-foreground/[0.16] text-foreground",
      },
    },
    defaultVariants: {
      variant: DEFAULT_VARIANT,
    },
  }
)

const defaultRemoveLabel = (value: string) => `Remove ${value}`

type TagInputProps = Omit<React.ComponentProps<"input">, "value" | "onChange" | "size"> &
  VariantProps<typeof chipVariants> & {
    values: string[]
    onRemove?: (index: number) => void
    inputValue?: string
    onInputValueChange?: (value: string) => void
    /** Builds the remove button's aria-label — pass a next-intl translator to localize it, e.g. `(value) => t("removeTag", { value })`. */
    removeLabel?: (value: string) => string
  }

function TagInput({
  className,
  variant = DEFAULT_VARIANT,
  values,
  onRemove,
  inputValue,
  onInputValueChange,
  removeLabel = defaultRemoveLabel,
  disabled,
  placeholder,
  "aria-invalid": ariaInvalid,
  ...props
}: TagInputProps) {
  return (
    <div
      data-slot="tag-input"
      className={cn(tagInputVariants(), className)}
    >
      {values.map((value, index) => (
        <span key={`${value}-${index}`} data-slot="tag-input-chip" className={chipVariants({ variant })}>
          {value}
          <button
            type="button"
            onClick={() => onRemove?.(index)}
            disabled={disabled}
            aria-label={removeLabel(value)}
            className="shrink-0 flex items-center justify-center opacity-70 outline-none hover:opacity-100 disabled:pointer-events-none"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <input
        type="text"
        data-slot="input"
        disabled={disabled}
        placeholder={values.length === 0 ? placeholder : undefined}
        aria-invalid={ariaInvalid}
        {...(inputValue !== undefined
          ? { value: inputValue, onChange: (e) => onInputValueChange?.(e.target.value) }
          : {})}
        className="min-w-[60px] flex-1 border-0 bg-transparent p-0 text-[15px] text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        {...props}
      />
    </div>
  )
}

export { TagInput, tagInputVariants, chipVariants }
export type { TagInputProps }
