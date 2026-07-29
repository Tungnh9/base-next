"use client"

import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { Input, type InputProps } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Label + control + error message shell. Extracted because customer-form.tsx
// repeats this exact wrapper ~30 times. Named CustomerField (not FormField)
// to avoid shadowing @/components/ui/form.tsx's own FormField, which is
// Controller-only and would force every plain text input in this form into a
// controlled field for no benefit.
export function CustomerField({
  id,
  label,
  error,
  required,
  className,
  children,
}: {
  id?: string
  label: string
  error?: string
  /** Shows a red "*" after the label — visual only, doesn't set native `required` (that would trigger the browser's own validation UI on top of Zod's). */
  required?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      {/* The "*" sits next to, not inside, the <label> element — it's a
          sibling span, not label content. Testing Library's getByLabelText
          (and any real screen reader's label association) matches on the
          <label>'s own text, so keeping the label's text exactly equal to
          `label` (no appended "*") is what lets every existing
          getByLabelText(t("form.xxx")) call keep working unchanged. */}
      <div className="flex items-center gap-0.5">
        <Label htmlFor={id}>{label}</Label>
        {required && (
          <span className="text-destructive text-sm" aria-hidden="true">
            *
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

// CustomerField + Input in one call. `...rest` receives register()'s
// {name,onChange,onBlur,ref} — Input forwards its ref, so this works.
export function CustomerTextField({
  id,
  label,
  error,
  required,
  className,
  ...rest
}: InputProps & {
  id: string
  label: string
  error?: string
  required?: boolean
  className?: string
}) {
  return (
    <CustomerField id={id} label={label} error={error} required={required} className={className}>
      <Input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-required={required || undefined}
        {...rest}
      />
    </CustomerField>
  )
}
