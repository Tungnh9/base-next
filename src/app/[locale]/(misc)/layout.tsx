import type { ReactNode } from "react"

export default function MiscLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-svh flex-col bg-[#f8f7fa] dark:bg-[#25293C]">{children}</div>
}
