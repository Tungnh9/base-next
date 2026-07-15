import Image from "next/image"

interface AuthCardHeaderProps {
  appName: string
}

export function AuthCardHeader({ appName }: AuthCardHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-2.5">
      <Image src="/logo.svg" alt={appName} width={30} height={30} className="h-[30px] w-[30px]" />
      <span className="text-foreground text-[26px] leading-[36px] font-bold">{appName}</span>
    </div>
  )
}
