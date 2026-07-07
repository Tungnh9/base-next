import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center overflow-hidden bg-[#ECEEF7] px-4 py-12">
      {/* Inner wrapper — shapes are positioned relative to the card, not the viewport */}
      <div className="relative w-full max-w-[450px]">
        {/* Top-left border square — behind the tint square */}
        <div
          aria-hidden
          className="border-primary/16 pointer-events-none absolute -top-[92px] left-[43px] h-[150px] w-[150px] rounded-[20px] border"
        />
        {/* Top-left tint square — renders in front of the border square */}
        <div
          aria-hidden
          className="bg-primary/8 pointer-events-none absolute -top-[58px] -left-[44px] h-[200px] w-[200px] rounded-[10px]"
        />
        {/* Bottom-right dashed square — behind the tint square */}
        <div
          aria-hidden
          className="border-primary/16 pointer-events-none absolute -right-[57px] -bottom-[63px] h-[180px] w-[180px] rounded-[20px] border-2 border-dashed"
        />
        {/* Bottom-right tint square — renders in front of the dashed square */}
        <div
          aria-hidden
          className="bg-primary/8 pointer-events-none absolute -right-[35px] -bottom-[41px] h-[135px] w-[135px] rounded-[10px]"
        />
        {children}
      </div>
    </div>
  )
}
