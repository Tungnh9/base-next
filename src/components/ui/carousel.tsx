"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export type CarouselVariant =
  | "slide-only"
  | "with-control"
  | "with-indicator"
  | "with-caption"

export interface CarouselSlide {
  image: string
  alt?: string
  title?: string
  label?: string
  description?: string
}

// ─── Context ──────────────────────────────────────────────────────────────────

type CarouselContextValue = {
  currentIndex: number
  count: number
  prev: () => void
  next: () => void
  goTo: (index: number) => void
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) throw new Error("useCarousel must be used within <Carousel>")
  return ctx
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export interface CarouselProps {
  slides: CarouselSlide[]
  variant?: CarouselVariant
  autoPlay?: boolean
  interval?: number
  className?: string
}

function Carousel({
  slides,
  variant = "with-control",
  autoPlay = false,
  interval = 5000,
  className,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  // FIX #4 & #7: useRef instead of useState — hover events no longer
  // trigger a full subtree re-render; interval countdown is not reset on hover.
  const isPausedRef = React.useRef(false)
  const count = slides.length

  // FIX #1: guard against empty slides array (count === 0 → modulo-by-zero = NaN)
  const prev = React.useCallback(() => {
    if (count === 0) return
    setCurrentIndex(i => (i - 1 + count) % count)
  }, [count])

  const next = React.useCallback(() => {
    if (count === 0) return
    setCurrentIndex(i => (i + 1) % count)
  }, [count])

  // FIX #3: clamp index to valid range in goTo
  const goTo = React.useCallback(
    (index: number) => {
      if (count === 0) return
      setCurrentIndex(Math.max(0, Math.min(index, count - 1)))
    },
    [count]
  )

  React.useEffect(() => {
    if (!autoPlay || count < 2) return
    // FIX #2: enforce minimum interval to prevent runaway spinning
    const safeInterval = Math.max(100, interval)
    // FIX #4: check the ref inside the callback — interval is never torn down
    // on hover, so the countdown is preserved across mouse enter/leave.
    const timer = setInterval(() => {
      if (!isPausedRef.current) next()
    }, safeInterval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, next, count])

  const showControls = variant !== "slide-only"
  const showIndicators =
    variant === "with-indicator" || variant === "with-caption"
  const showCaption = variant === "with-caption"
  const current = slides[currentIndex]

  return (
    <CarouselContext.Provider value={{ currentIndex, count, prev, next, goTo }}>
      <div
        role="region"
        aria-roledescription="carousel"
        className={cn("relative w-full overflow-hidden rounded-md", className)}
        onMouseEnter={() => { isPausedRef.current = true }}
        onMouseLeave={() => { isPausedRef.current = false }}
      >
        <CarouselContent slides={slides} showTitle={!showCaption} />

        {showControls && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}

        {showIndicators && <CarouselIndicators />}

        {showCaption && (
          <CarouselCaption
            label={current?.label}
            description={current?.description}
          />
        )}
      </div>
    </CarouselContext.Provider>
  )
}

// ─── Content (slide strip) ─────────────────────────────────────────────────────

function CarouselContent({
  slides,
  showTitle = true,
}: {
  slides: CarouselSlide[]
  showTitle?: boolean
}) {
  const { currentIndex } = useCarousel()
  return (
    <div
      className="flex h-[350px] transition-transform duration-500 ease-in-out"
      style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      aria-live="polite"
    >
      {/* FIX #5: use slide.image as key instead of array index to prevent
          DOM reuse and stale-image flash when the slides array is replaced */}
      {slides.map((slide) => (
        <CarouselItem key={slide.image} slide={slide} showTitle={showTitle} />
      ))}
    </div>
  )
}

// ─── Item (single slide) ───────────────────────────────────────────────────────

function CarouselItem({
  slide,
  showTitle = true,
  className,
}: {
  slide: CarouselSlide
  showTitle?: boolean
  className?: string
}) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn("relative flex-[0_0_100%] h-full", className)}
    >
      <img
        src={slide.image}
        alt={slide.alt ?? ""}
        className="absolute inset-0 size-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      {showTitle && slide.title && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[38px] font-semibold leading-[52px] text-white whitespace-nowrap drop-shadow-md">
            {slide.title}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Nav button (internal) ─────────────────────────────────────────────────────
// FIX #8: merge CarouselPrevious/Next into one component to eliminate
// structural duplication; any style change now applies to both directions.

function CarouselNavButton({
  direction,
  className,
}: {
  direction: "prev" | "next"
  className?: string
}) {
  const { prev, next } = useCarousel()
  // FIX #6: aria-labels via next-intl (no more hardcoded English strings)
  const t = useTranslations("carousel")
  const isPrev = direction === "prev"

  return (
    <button
      type="button"
      onClick={isPrev ? prev : next}
      aria-label={isPrev ? t("prevSlide") : t("nextSlide")}
      className={cn(
        "absolute top-0 z-10 h-full flex items-center transition-colors",
        "text-white/70 hover:text-white",
        isPrev ? "left-0 pl-5 pr-2" : "right-0 pr-5 pl-2",
        className
      )}
    >
      {isPrev
        ? <ChevronLeft className="size-[30px]" strokeWidth={1.5} />
        : <ChevronRight className="size-[30px]" strokeWidth={1.5} />}
    </button>
  )
}

// ─── Previous / Next (public exports) ─────────────────────────────────────────

function CarouselPrevious({ className }: { className?: string }) {
  return <CarouselNavButton direction="prev" className={className} />
}

function CarouselNext({ className }: { className?: string }) {
  return <CarouselNavButton direction="next" className={className} />
}

// ─── Indicators ────────────────────────────────────────────────────────────────

function CarouselIndicators({ className }: { className?: string }) {
  const { currentIndex, count, goTo } = useCarousel()
  // FIX #6: aria-label via next-intl
  const t = useTranslations("carousel")

  return (
    <div
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-end gap-2",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => goTo(i)}
          aria-label={t("goToSlide", { index: i + 1 })}
          className={cn(
            "h-[5px] w-[35px] rounded-[6px] transition-all duration-300",
            i === currentIndex ? "bg-white" : "bg-white/40"
          )}
        />
      ))}
    </div>
  )
}

// ─── Caption ───────────────────────────────────────────────────────────────────

function CarouselCaption({
  label,
  description,
  className,
}: {
  label?: string
  description?: string
  className?: string
}) {
  if (!label && !description) return null
  return (
    <div
      className={cn(
        "absolute bottom-[51px] left-[60px] right-[60px] z-10",
        "flex flex-col gap-2 text-center text-white",
        className
      )}
    >
      {label && (
        <p className="text-[18px] font-semibold leading-[24px]">{label}</p>
      )}
      {description && (
        <p className="text-[15px] font-normal leading-[22px] opacity-90">
          {description}
        </p>
      )}
    </div>
  )
}

// ─── Exports ───────────────────────────────────────────────────────────────────

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
  CarouselCaption,
  useCarousel,
}
