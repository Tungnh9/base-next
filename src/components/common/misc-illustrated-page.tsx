import Image from "next/image"
import type { ReactNode } from "react"

interface MiscIllustratedPageProps {
  title: string
  subtitle: ReactNode
  illustrationSrc: string
  illustrationWidth: number
  illustrationHeight: number
  // Real, non-empty alt text opts the illustration out of aria-hidden — used
  // by the 404 page, where the image is the only visual cue on the page.
  illustrationAlt?: string
  children?: ReactNode
}

// Shared shell for the public "misc" pages (maintenance/coming-soon/
// not-authorized) and the 404 page: background shapes + centered heading/
// subtitle + optional action area + bottom illustration.
export function MiscIllustratedPage({
  title,
  subtitle,
  illustrationSrc,
  illustrationWidth,
  illustrationHeight,
  illustrationAlt = "",
  children,
}: MiscIllustratedPageProps) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden pt-[100px]">
      <Image
        src="/icons/shape-light.svg"
        alt=""
        aria-hidden
        width={1440}
        height={352}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-auto w-full dark:hidden"
      />
      <Image
        src="/icons/shape-dark.svg"
        alt=""
        aria-hidden
        width={1440}
        height={352}
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-auto w-full dark:block"
      />

      <div className="relative z-10 flex flex-col items-center gap-[6px] text-center">
        <h1 className="text-foreground text-[32px] leading-[44px] font-semibold">{title}</h1>
        <div className="text-[15px] leading-[22px] text-[var(--text-body)]">{subtitle}</div>
      </div>

      {children}

      <Image
        src={illustrationSrc}
        alt={illustrationAlt}
        aria-hidden={!illustrationAlt}
        width={illustrationWidth}
        height={illustrationHeight}
        priority
        className="relative z-10 mt-[80.5px]"
      />
    </div>
  )
}
