"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type CustomOptionType = "radio" | "checkbox"
type CustomOptionVariant = "horizontal" | "vertical" | "image"

// ─── Context ──────────────────────────────────────────────────────────────────

interface CustomOptionContextValue {
  type: CustomOptionType
}
const CustomOptionContext = React.createContext<CustomOptionContextValue>({ type: "radio" })

// ─── Group ────────────────────────────────────────────────────────────────────

interface CustomOptionGroupProps extends Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Root>,
  "asChild"
> {
  /** "radio" renders a single-select RadioGroup; "checkbox" wraps children in a plain div */
  type?: CustomOptionType
  className?: string
}

function CustomOptionGroup({
  type = "radio",
  className,
  children,
  ...radioProps
}: CustomOptionGroupProps) {
  if (type === "checkbox") {
    return (
      <CustomOptionContext.Provider value={{ type: "checkbox" }}>
        <div data-slot="custom-option-group" className={cn("flex flex-col gap-3", className)}>
          {children}
        </div>
      </CustomOptionContext.Provider>
    )
  }

  return (
    <CustomOptionContext.Provider value={{ type: "radio" }}>
      <RadioGroupPrimitive.Root
        data-slot="custom-option-group"
        className={cn("flex flex-col gap-3", className)}
        {...radioProps}
      >
        {children}
      </RadioGroupPrimitive.Root>
    </CustomOptionContext.Provider>
  )
}

// ─── Indicator sub-components (module-level to satisfy react-hooks/static-components) ──

function RadioCircle({ className: cls }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-[18px] shrink-0 rounded-full",
        "border-muted-foreground/60 border-[1.5px]",
        "group-data-[state=checked]:border-primary group-data-[state=checked]:border-[5px]",
        "group-data-[state=checked]:bg-card group-data-[state=checked]:shadow-[0px_2px_4px_rgba(165,163,174,0.3)]",
        cls
      )}
    />
  )
}

function CheckboxBox({ checked, className: cls }: { checked?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        "size-[18px] rounded-[4px] border-[1.5px]",
        "border-muted-foreground/60 bg-transparent",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=checked]:shadow-[0px_2px_2px_rgba(165,163,174,0.3)]",
        cls
      )}
    >
      {checked && <CheckIcon className="size-3.5" />}
    </span>
  )
}

// ─── Item ─────────────────────────────────────────────────────────────────────

interface CustomOptionItemProps {
  /** Radio value (required when inside CustomOptionGroup with type="radio") */
  value?: string
  label?: string
  description?: string
  /** Short badge text shown inline next to the label (e.g. "Free", "20%") */
  badge?: string
  /** Icon node shown in the vertical variant */
  icon?: React.ReactNode
  /** Image URL for the image variant */
  image?: string
  imageAlt?: string
  variant?: CustomOptionVariant
  /** Override the group type for standalone use (defaults to context type) */
  type?: CustomOptionType
  disabled?: boolean
  className?: string
  /** Checkbox controlled state (used when not inside a radio CustomOptionGroup) */
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function CustomOptionItem({
  value = "",
  label,
  description,
  badge,
  icon,
  image,
  imageAlt,
  variant = "horizontal",
  type: typeProp,
  disabled,
  className,
  checked,
  onCheckedChange,
}: CustomOptionItemProps) {
  const ctx = React.useContext(CustomOptionContext)
  const type = typeProp ?? ctx.type

  const sharedCardClass = cn(
    "relative cursor-pointer rounded-xl border border-border bg-card text-card-foreground",
    "transition-[border-color,box-shadow] duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Radix adds data-disabled on RadioGroup.Item; plain disabled attr works for buttons
    "disabled:cursor-[no-drop] disabled:opacity-50",
    "data-[disabled]:cursor-[no-drop] data-[disabled]:opacity-50",
    disabled && "cursor-[no-drop] opacity-50",
    className
  )

  // Badge element
  const BadgeEl = badge ? (
    <span className="bg-muted text-muted-foreground ml-auto shrink-0 rounded px-2 py-0.5 text-xs font-medium">
      {badge}
    </span>
  ) : null

  // ════════════════════════════════════════════════════════════════════════════
  // Horizontal
  // ════════════════════════════════════════════════════════════════════════════
  if (variant === "horizontal") {
    const inner = (
      <div className="flex items-start gap-3 p-4">
        {type === "radio" ? (
          <RadioCircle className="mt-0.5" />
        ) : (
          <CheckboxBox checked={checked} className="mt-0.5" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {(label || badge) && (
            <div className="flex items-center gap-2">
              {label && <span className="text-foreground leading-none font-medium">{label}</span>}
              {BadgeEl}
            </div>
          )}
          {description && (
            <p className="text-muted-foreground text-sm leading-normal">{description}</p>
          )}
        </div>
      </div>
    )

    if (type === "radio") {
      return (
        <RadioGroupPrimitive.Item
          data-slot="custom-option-item"
          value={value}
          disabled={disabled}
          className={cn(
            sharedCardClass,
            "group w-full text-left",
            "data-[state=checked]:border-primary data-[state=checked]:shadow-sm"
          )}
        >
          {inner}
        </RadioGroupPrimitive.Item>
      )
    }

    return (
      <div
        data-slot="custom-option-item"
        aria-disabled={disabled}
        className={cn(sharedCardClass, checked && "border-primary shadow-sm")}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
      >
        {inner}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Vertical
  // ════════════════════════════════════════════════════════════════════════════
  if (variant === "vertical") {
    const inner = (
      <div className="flex flex-col items-center gap-4 px-4 py-6 text-center">
        {icon && <div className="text-primary [&>svg]:size-8">{icon}</div>}
        <div className="flex flex-col gap-1">
          {label && <span className="text-foreground leading-tight font-semibold">{label}</span>}
          {description && (
            <p className="text-muted-foreground text-sm leading-normal">{description}</p>
          )}
        </div>
        {type === "radio" ? <RadioCircle /> : <CheckboxBox checked={checked} />}
      </div>
    )

    if (type === "radio") {
      return (
        <RadioGroupPrimitive.Item
          data-slot="custom-option-item"
          value={value}
          disabled={disabled}
          className={cn(
            sharedCardClass,
            "group w-full",
            "data-[state=checked]:border-primary data-[state=checked]:shadow-sm"
          )}
        >
          {inner}
        </RadioGroupPrimitive.Item>
      )
    }

    return (
      <div
        data-slot="custom-option-item"
        aria-disabled={disabled}
        className={cn(sharedCardClass, checked && "border-primary shadow-sm")}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
      >
        {inner}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Image
  // ════════════════════════════════════════════════════════════════════════════
  if (variant === "image") {
    const inner = (
      <>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={imageAlt ?? label ?? ""} className="h-full w-full object-cover" />
        )}
        {type === "checkbox" && (
          <CheckboxBox checked={checked} className="absolute top-3 right-3" />
        )}
      </>
    )

    if (type === "radio") {
      return (
        <RadioGroupPrimitive.Item
          data-slot="custom-option-item"
          value={value}
          disabled={disabled}
          className={cn(
            sharedCardClass,
            "group aspect-[4/3] overflow-hidden p-0",
            "data-[state=checked]:border-primary data-[state=checked]:shadow-sm"
          )}
        >
          {inner}
        </RadioGroupPrimitive.Item>
      )
    }

    return (
      <div
        data-slot="custom-option-item"
        aria-disabled={disabled}
        className={cn(
          sharedCardClass,
          "aspect-[4/3] overflow-hidden p-0",
          checked && "border-primary shadow-sm"
        )}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
      >
        {inner}
      </div>
    )
  }

  return null
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { CustomOptionGroup, CustomOptionItem }
export type { CustomOptionType, CustomOptionVariant, CustomOptionGroupProps, CustomOptionItemProps }
