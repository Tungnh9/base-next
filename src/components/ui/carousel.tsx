"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export type CarouselVariant = "slide-only" | "with-control" | "with-indicator" | "with-caption"

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
  label?: string
}

function Carousel({
  slides,
  variant = "with-control",
  autoPlay = false,
  interval = 5000,
  className,
  label,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const isPausedRef = React.useRef(false)
  const t = useTranslations("carousel")
  const count = slides.length

  const prev = React.useCallback(() => {
    if (count === 0) return
    setCurrentIndex((i) => (i - 1 + count) % count)
  }, [count])

  const next = React.useCallback(() => {
    if (count === 0) return
    setCurrentIndex((i) => (i + 1) % count)
  }, [count])

  const goTo = React.useCallback(
    (index: number) => {
      if (count === 0) return
      setCurrentIndex(Math.max(0, Math.min(index, count - 1)))
    },
    [count]
  )

  // Clamp currentIndex when the slides array shrinks so it never points out of range
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex((i) => (count > 0 && i >= count ? count - 1 : i))
  }, [count])

  React.useEffect(() => {
    if (!autoPlay || count < 2) return
    const safeInterval = Math.max(100, interval)
    const timer = setInterval(() => {
      if (!isPausedRef.current) next()
    }, safeInterval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, next, count])

  const contextValue = React.useMemo(
    () => ({ currentIndex, count, prev, next, goTo }),
    [currentIndex, count, prev, next, goTo]
  )

  const showControls = variant !== "slide-only"
  const showIndicators = variant === "with-indicator" || variant === "with-caption"
  const showCaption = variant === "with-caption"
  const current = slides[currentIndex]

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        className={cn("relative w-full overflow-hidden rounded-md", className)}
        onMouseEnter={() => {
          isPausedRef.current = true
        }}
        onMouseLeave={() => {
          isPausedRef.current = false
        }}
      >
        {/* Visually hidden — text content changes on each slide, triggering screen reader announcement.
            CSS transform on the slide strip does not mutate DOM text, so aria-live there is ineffective. */}
        <span aria-live="polite" aria-atomic="true" className="sr-only">
          {t("slideLabel", { index: currentIndex + 1, total: count })}
          {slides[currentIndex]?.title ? ` — ${slides[currentIndex].title}` : ""}
        </span>

        <CarouselContent slides={slides} showTitle={!showCaption} />

        {showControls && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}

        {showIndicators && <CarouselIndicators />}

        {showCaption && (
          <CarouselCaption label={current?.label} description={current?.description} />
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
    >
      {slides.map((slide, i) => (
        <CarouselItem
          key={i}
          slide={slide}
          showTitle={showTitle}
          aria-label={`${i + 1} / ${slides.length}`}
        />
      ))}
    </div>
  )
}

// ─── Item (single slide) ───────────────────────────────────────────────────────

function CarouselItem({
  slide,
  showTitle = true,
  className,
  ...props
}: {
  slide: CarouselSlide
  showTitle?: boolean
} & Omit<React.ComponentProps<"div">, "role">) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      {...props}
      className={cn("relative h-full flex-[0_0_100%]", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.image}
        alt={slide.alt ?? ""}
        className="pointer-events-none absolute inset-0 size-full object-cover select-none"
        draggable={false}
      />

      {showTitle && slide.title && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[38px] leading-[52px] font-semibold whitespace-nowrap text-white drop-shadow-md">
            {slide.title}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Nav button (internal) ─────────────────────────────────────────────────────

function CarouselNavButton({
  direction,
  className,
}: {
  direction: "prev" | "next"
  className?: string
}) {
  const { prev, next } = useCarousel()
  const t = useTranslations("carousel")
  const isPrev = direction === "prev"

  return (
    <button
      type="button"
      onClick={isPrev ? prev : next}
      aria-label={isPrev ? t("prevSlide") : t("nextSlide")}
      className={cn(
        "absolute top-0 z-10 flex h-full cursor-pointer items-center transition-colors",
        "text-white/70 hover:text-white",
        isPrev ? "left-0 pr-2 pl-5" : "right-0 pr-5 pl-2",
        className
      )}
    >
      {isPrev ? (
        <ChevronLeft className="size-[30px]" strokeWidth={1.5} />
      ) : (
        <ChevronRight className="size-[30px]" strokeWidth={1.5} />
      )}
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
  const t = useTranslations("carousel")

  return (
    <div
      className={cn(
        "absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-end gap-2",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => goTo(i)}
          aria-label={t("goToSlide", { index: i + 1 })}
          aria-pressed={i === currentIndex}
          className={cn(
            "h-[5px] w-[35px] cursor-pointer rounded-[6px] transition-all duration-300",
            i === currentIndex ? "bg-white hover:opacity-80" : "bg-white/40 hover:bg-white/65"
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
        "absolute right-[60px] bottom-[51px] left-[60px] z-10",
        "flex flex-col gap-2 text-center text-white",
        className
      )}
    >
      {label && <p className="text-[18px] leading-[24px] font-semibold">{label}</p>}
      {description && (
        <p className="text-[15px] leading-[22px] font-normal opacity-90">{description}</p>
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
