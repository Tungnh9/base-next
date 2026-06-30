import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const DEFAULT_VARIANT = "primary" as const
const DEFAULT_SKIN    = "filled"  as const
const DEFAULT_SIZE    = "sm"      as const

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        primary:   "",
        secondary: "",
        success:   "",
        danger:    "",
        warning:   "",
        info:      "",
        dark:      "",
      },
      skin: {
        filled: "",
        light:  "",
        dot:    "",
      },
      size: {
        sm: "px-2.5 py-0.5 text-xs [&_svg]:size-3.5",
        md: "px-3.5 py-1   text-sm [&_svg]:size-4",
      },
    },
    compoundVariants: [
      // filled
      { variant: "primary",   skin: "filled", className: "bg-primary     text-white" },
      { variant: "secondary", skin: "filled", className: "bg-secondary   text-white" },
      { variant: "success",   skin: "filled", className: "bg-success     text-white" },
      { variant: "danger",    skin: "filled", className: "bg-destructive text-white" },
      { variant: "warning",   skin: "filled", className: "bg-warning     text-white" },
      { variant: "info",      skin: "filled", className: "bg-info        text-white" },
      { variant: "dark",      skin: "filled", className: "bg-foreground  text-background" },
      // light
      { variant: "primary",   skin: "light", className: "bg-primary/10     text-primary" },
      { variant: "secondary", skin: "light", className: "bg-secondary/10   text-secondary" },
      { variant: "success",   skin: "light", className: "bg-success/10     text-success" },
      { variant: "danger",    skin: "light", className: "bg-destructive/10 text-destructive" },
      { variant: "warning",   skin: "light", className: "bg-warning/10     text-warning" },
      { variant: "info",      skin: "light", className: "bg-info/10        text-info" },
      { variant: "dark",      skin: "light", className: "bg-foreground/10  text-foreground" },
      // dot — transparent background, colored text only
      { variant: "primary",   skin: "dot", className: "text-primary" },
      { variant: "secondary", skin: "dot", className: "text-secondary" },
      { variant: "success",   skin: "dot", className: "text-success" },
      { variant: "danger",    skin: "dot", className: "text-destructive" },
      { variant: "warning",   skin: "dot", className: "text-warning" },
      { variant: "info",      skin: "dot", className: "text-info" },
      { variant: "dark",      skin: "dot", className: "text-foreground" },
    ],
    defaultVariants: {
      variant: DEFAULT_VARIANT,
      skin:    DEFAULT_SKIN,
      size:    DEFAULT_SIZE,
    },
  }
)

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>
type BadgeSkin    = NonNullable<VariantProps<typeof badgeVariants>["skin"]>
type BadgeSize    = NonNullable<VariantProps<typeof badgeVariants>["size"]>

function Badge({
  className,
  variant = DEFAULT_VARIANT,
  skin = DEFAULT_SKIN,
  size = DEFAULT_SIZE,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-skin={skin}
      className={cn(badgeVariants({ variant, skin, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
export type { BadgeVariant, BadgeSkin, BadgeSize }
