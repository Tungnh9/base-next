"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Figma "Avatar": circle image, sizes 26/32/38/48/64/72.
type AvatarSize = 26 | 32 | 38 | 48 | 64 | 72
// Figma "Initials" / "Label Initials": same size scale as color-variant fallbacks —
// "filled" = solid bg + white text, "light" = bg at 10% opacity + colored text.
// Color names mirror Badge's convention (danger -> --destructive) for consistency.
type AvatarColor = "primary" | "secondary" | "success" | "danger" | "warning" | "info"
type AvatarSkin = "filled" | "light"
// Figma "Status Indicator": bottom-right dot, ringed with the card background.
type AvatarStatus = "online" | "offline" | "busy" | "away"
// Figma "Shapes": three border-radius options.
type AvatarShape = "square" | "rounded" | "round"

const AVATAR_SIZE_CLASSES: Record<AvatarSize, string> = {
  26: "size-[26px]",
  32: "size-[32px]",
  38: "size-[38px]",
  48: "size-[48px]",
  64: "size-[64px]",
  72: "size-[72px]",
}

// Figma initials text scale per avatar size (font-size/line-height don't follow a
// single formula, so they're looked up directly instead of derived).
const AVATAR_TEXT_CLASSES: Record<AvatarSize, string> = {
  26: "text-[11px] leading-[14px]",
  32: "text-[13px] leading-[14px]",
  38: "text-[15px] leading-[21px]",
  48: "text-[18px] leading-[24px]",
  64: "text-[32px] leading-[44px]",
  72: "text-[38px] leading-[52px]",
}

// Figma only specs the status dot at size 38 (12px, ~32% of the avatar). Other
// sizes are scaled from that ratio since no other size was designed.
const AVATAR_STATUS_SIZE_CLASSES: Record<AvatarSize, string> = {
  26: "size-2",
  32: "size-2.5",
  38: "size-3",
  48: "size-[15px]",
  64: "size-5",
  72: "size-[23px]",
}

const AVATAR_SHAPE_CLASSES: Record<AvatarShape, string> = {
  square: "rounded-[4px]",
  rounded: "rounded-[8px]",
  round: "rounded-full",
}

// Light skin uses /10 opacity to match Badge's "light" variant tint convention.
const AVATAR_COLOR_CLASSES: Record<AvatarColor, Record<AvatarSkin, string>> = {
  primary: { filled: "bg-primary text-white", light: "bg-primary/10 text-primary" },
  secondary: { filled: "bg-secondary text-white", light: "bg-secondary/10 text-secondary" },
  success: { filled: "bg-success text-white", light: "bg-success/10 text-success" },
  danger: { filled: "bg-destructive text-white", light: "bg-destructive/10 text-destructive" },
  warning: { filled: "bg-warning text-white", light: "bg-warning/10 text-warning" },
  info: { filled: "bg-info text-white", light: "bg-info/10 text-info" },
}

const AVATAR_STATUS_CLASSES: Record<AvatarStatus, string> = {
  online: "bg-success",
  offline: "bg-secondary",
  busy: "bg-destructive",
  away: "bg-warning",
}

// Propagates resolved size and shape from Avatar (or AvatarGroup) to children.
const AvatarContext = React.createContext<{ size: AvatarSize; shape: AvatarShape }>({
  size: 38,
  shape: "round",
})

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: AvatarSize
  shape?: AvatarShape
  status?: AvatarStatus
}

// Root is wrapped in a plain relative element because Root itself needs
// overflow-hidden to clip the image, which would also clip the status dot.
function Avatar({ className, size, shape, status, ...props }: AvatarProps) {
  const ctx = React.useContext(AvatarContext)
  const resolvedSize = size ?? ctx.size
  const resolvedShape = shape ?? ctx.shape
  const shapeClass = AVATAR_SHAPE_CLASSES[resolvedShape]

  return (
    <AvatarContext.Provider value={{ size: resolvedSize, shape: resolvedShape }}>
      <div className={cn("relative inline-flex shrink-0", AVATAR_SIZE_CLASSES[resolvedSize])}>
        <AvatarPrimitive.Root
          data-slot="avatar"
          className={cn("flex size-full shrink-0 overflow-hidden", shapeClass, className)}
          {...props}
        />
        {status && (
          <span
            aria-hidden="true"
            data-slot="avatar-status"
            className={cn(
              "border-card absolute right-0 bottom-0 rounded-full border-2",
              AVATAR_STATUS_SIZE_CLASSES[resolvedSize],
              AVATAR_STATUS_CLASSES[status]
            )}
          />
        )}
      </div>
    </AvatarContext.Provider>
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

type AvatarFallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  size?: AvatarSize
  color?: AvatarColor
  skin?: AvatarSkin
}

function AvatarFallback({
  className,
  size,
  color = "primary",
  skin = "filled",
  ...props
}: AvatarFallbackProps) {
  const ctx = React.useContext(AvatarContext)
  const resolvedSize = size ?? ctx.size
  const shapeClass = AVATAR_SHAPE_CLASSES[ctx.shape]
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center font-semibold",
        shapeClass,
        AVATAR_TEXT_CLASSES[resolvedSize],
        AVATAR_COLOR_CLASSES[color][skin],
        className
      )}
      {...props}
    />
  )
}

type AvatarGroupProps = React.ComponentProps<"div"> & {
  size?: AvatarSize
  shape?: AvatarShape
  /** Caps how many avatars render before collapsing the rest into a "+N" badge. */
  max?: number
}

// Figma "Avatar Group": avatars overlap by ~21% of their size with a card-colored
// border between them. z-index is set explicitly (rather than relying on DOM
// order) so later avatars always paint over earlier ones, matching the design.
function AvatarGroup({
  className,
  size = 38,
  shape = "round",
  max,
  children,
  ...props
}: AvatarGroupProps) {
  const items = React.Children.toArray(children)
  const visible = max != null ? items.slice(0, max) : items
  const overflowCount = items.length - visible.length
  const overlapPx = -Math.round(size * 0.21)
  const shapeClass = AVATAR_SHAPE_CLASSES[shape]

  return (
    <AvatarContext.Provider value={{ size, shape }}>
      <div data-slot="avatar-group" className={cn("flex items-center", className)} {...props}>
        {visible.map((child, index) => (
          <div
            key={(child as React.ReactElement).key ?? index}
            className={cn("border-card overflow-hidden border-2", shapeClass)}
            style={{ marginLeft: index === 0 ? 0 : overlapPx, zIndex: index }}
          >
            {child}
          </div>
        ))}
        {overflowCount > 0 && (
          <div
            data-slot="avatar-group-count"
            className={cn(
              "border-card bg-muted text-text-body flex shrink-0 items-center justify-center border-2 font-semibold",
              shapeClass,
              AVATAR_SIZE_CLASSES[size],
              AVATAR_TEXT_CLASSES[size]
            )}
            style={{ marginLeft: overlapPx, zIndex: visible.length }}
          >
            +{overflowCount}
          </div>
        )}
      </div>
    </AvatarContext.Provider>
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup }
export type {
  AvatarProps,
  AvatarFallbackProps,
  AvatarGroupProps,
  AvatarSize,
  AvatarColor,
  AvatarSkin,
  AvatarStatus,
  AvatarShape,
}
