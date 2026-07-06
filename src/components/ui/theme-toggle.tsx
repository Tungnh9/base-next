"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useUiStore } from "@/stores/ui-store"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const setZustandTheme = useUiStore((s) => s.setTheme)

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    setZustandTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="text-muted-foreground hover:text-foreground relative flex size-[26px] items-center justify-center transition-colors"
    >
      <Sun className="size-[22px] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
      <Moon className="absolute size-[22px] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </button>
  )
}
