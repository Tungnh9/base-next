"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FIELD_SIZE } from "@/lib/field-variants"
import { Input, type InputProps } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroupItem } from "@/components/ui/radio"

// ─── Context ──────────────────────────────────────────────────────────────────

type GroupSize = "sm" | "default" | "lg"

const InputGroupCtx = React.createContext<{ size: GroupSize }>({ size: "default" })

function useInputGroup() {
  return React.useContext(InputGroupCtx)
}

// ─── InputGroup ───────────────────────────────────────────────────────────────

type InputGroupProps = React.ComponentProps<"div"> & { size?: GroupSize }

function InputGroup({ children, size = "default", className, ...props }: InputGroupProps) {
  return (
    <InputGroupCtx.Provider value={{ size }}>
      <div
        data-slot="input-group"
        className={cn(
          "flex items-stretch overflow-hidden",
          "border border-input",
          FIELD_SIZE[size].radius,
          // Dividers between adjacent children (specificity 0,2,0 — overrides child border-0)
          "[&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-input",
          // Group-level focus + validation
          "focus-within:border-primary focus-within:shadow-[0px_2px_2px_rgba(165,163,174,0.3)]",
          "has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:focus-within:border-destructive dark:has-[input[aria-invalid=true]]:border-destructive",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </InputGroupCtx.Provider>
  )
}

// ─── InputGroupInput ──────────────────────────────────────────────────────────

// Input variant for use inside InputGroup — strips its own border/radius/shadow.
// The group's divider rule (specificity 0,2,0) restores border-right for non-last children.

type InputGroupInputProps = Omit<InputProps, "size">

const InputGroupInput = React.forwardRef<HTMLInputElement, InputGroupInputProps>(
  function InputGroupInput({ className, ...props }, ref) {
    const { size } = useInputGroup()
    return (
      <Input
        ref={ref}
        size={size}
        className={cn("flex-1 border-0 rounded-none shadow-none", className)}
        {...props}
      />
    )
  }
)

// ─── InputAddon ───────────────────────────────────────────────────────────────

// Text / icon addon cell with muted background.

const ADDON_SIZE = {
  sm:      "px-[10px] text-[13px]",
  default: "px-[14px] text-[15px]",
  lg:      "px-4 text-[18px]",
} as const

type InputAddonProps = React.ComponentProps<"span">

function InputAddon({ children, className, ...props }: InputAddonProps) {
  const { size } = useInputGroup()
  return (
    <span
      data-slot="input-addon"
      className={cn(
        "inline-flex shrink-0 items-center",
        "bg-muted text-muted-foreground",
        "whitespace-nowrap select-none",
        ADDON_SIZE[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// ─── InputGroupCheckbox ───────────────────────────────────────────────────────

// Checkbox addon cell — wraps Checkbox inside a muted-background cell.

type InputGroupCheckboxProps = React.ComponentProps<typeof Checkbox> & {
  wrapperClassName?: string
}

function InputGroupCheckbox({ wrapperClassName, className, ...props }: InputGroupCheckboxProps) {
  return (
    <span
      data-slot="input-group-checkbox"
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-muted px-3",
        wrapperClassName
      )}
    >
      <Checkbox className={className} {...props} />
    </span>
  )
}

// ─── InputGroupRadio ──────────────────────────────────────────────────────────

// Radio addon cell — must be used inside a <RadioGroup> for correct behavior.

type InputGroupRadioProps = React.ComponentProps<typeof RadioGroupItem> & {
  wrapperClassName?: string
}

function InputGroupRadio({ wrapperClassName, className, ...props }: InputGroupRadioProps) {
  return (
    <span
      data-slot="input-group-radio"
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-muted px-3",
        wrapperClassName
      )}
    >
      <RadioGroupItem className={className} {...props} />
    </span>
  )
}

// ─── InputGroupButton ─────────────────────────────────────────────────────────

// Button variant for use inside InputGroup — removes border/radius/shadow and fills height.
// The group's divider rule adds a right-side separator for non-last children.

type InputGroupButtonProps = Omit<React.ComponentProps<typeof Button>, "size">

function InputGroupButton({
  className,
  variant = "outline",
  ...props
}: InputGroupButtonProps) {
  const { size } = useInputGroup()
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("rounded-none shadow-none border-0 h-full", className)}
      {...props}
    />
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  InputGroup,
  InputGroupInput,
  InputAddon,
  InputGroupCheckbox,
  InputGroupRadio,
  InputGroupButton,
}
export { InputGroupCtx }
export type {
  InputGroupProps,
  InputGroupInputProps,
  InputAddonProps,
  InputGroupCheckboxProps,
  InputGroupRadioProps,
  InputGroupButtonProps,
  GroupSize,
}
