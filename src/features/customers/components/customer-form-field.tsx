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
  className,
  children,
}: {
  id?: string
  label: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
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
  className,
  ...rest
}: InputProps & { id: string; label: string; error?: string; className?: string }) {
  return (
    <CustomerField id={id} label={label} error={error} className={className}>
      <Input id={id} aria-invalid={Boolean(error) || undefined} {...rest} />
    </CustomerField>
  )
}
