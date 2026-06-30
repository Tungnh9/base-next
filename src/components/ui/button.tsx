import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-medium whitespace-nowrap tracking-[0.43px] transition-all duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-65 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0px_2px_4px_rgba(165,163,174,0.3)] enabled:hover:brightness-90 enabled:active:brightness-[0.85] disabled:shadow-none dark:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0px_2px_4px_rgba(165,163,174,0.3)] enabled:hover:brightness-90 enabled:active:brightness-[0.85] disabled:shadow-none dark:shadow-none",
        destructive:
          "bg-destructive text-white shadow-[0px_2px_4px_rgba(165,163,174,0.3)] enabled:hover:brightness-90 enabled:active:brightness-[0.85] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 disabled:shadow-none dark:shadow-none",
        success:
          "bg-success text-white shadow-[0px_2px_4px_rgba(165,163,174,0.3)] enabled:hover:brightness-90 enabled:active:brightness-[0.85] focus-visible:ring-success/20 dark:focus-visible:ring-success/40 disabled:shadow-none dark:shadow-none",
        warning:
          "bg-warning text-white shadow-[0px_2px_4px_rgba(165,163,174,0.3)] enabled:hover:brightness-90 enabled:active:brightness-[0.85] focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40 disabled:shadow-none dark:shadow-none",
        info:
          "bg-info text-white shadow-[0px_2px_4px_rgba(165,163,174,0.3)] enabled:hover:brightness-90 enabled:active:brightness-[0.85] focus-visible:ring-info/20 dark:focus-visible:ring-info/40 disabled:shadow-none dark:shadow-none",
        dark:
          "bg-dark text-dark-foreground shadow-[0px_2px_4px_rgba(165,163,174,0.3)] enabled:hover:brightness-90 enabled:active:brightness-[0.85] focus-visible:ring-dark/20 disabled:shadow-none dark:shadow-none",
        outline:
          "border border-primary bg-transparent text-primary enabled:hover:bg-primary/10 enabled:active:bg-primary/15 focus-visible:border-primary",
        ghost:
          "bg-primary/[0.16] text-primary enabled:hover:bg-primary/[0.24] enabled:active:bg-primary/[0.28]",
        link: "text-primary underline-offset-4 enabled:hover:underline",
      },
      size: {
        // Figma Default: h=38px, px=20px, font=15px, radius=6px
        default:
          "h-[38px] rounded-[6px] px-5 text-[15px] has-[>svg]:px-4 [&_svg:not([class*='size-'])]:size-4",
        // Project extra-small (no Figma equivalent)
        xs:
          "h-6 gap-1 rounded-[4px] px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        // Figma Small: h=28px, px=14px, font=13px, radius=4px
        sm:
          "h-7 gap-1.5 rounded-[4px] px-[14px] text-[13px] has-[>svg]:px-[10px] [&_svg:not([class*='size-'])]:size-[14px]",
        // Figma Large: h=48px, px=26px, font=17px, radius=8px
        lg:
          "h-12 rounded-[8px] px-[26px] text-[17px] has-[>svg]:px-5 [&_svg:not([class*='size-'])]:size-[18px]",
        // Icon sizes match text button heights
        icon: "size-[38px] rounded-[6px] [&_svg:not([class*='size-'])]:size-[18px]",
        "icon-xs":
          "size-6 rounded-[4px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[4px] [&_svg:not([class*='size-'])]:size-[14px]",
        "icon-lg":
          "size-12 rounded-[8px] [&_svg:not([class*='size-'])]:size-[22px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
