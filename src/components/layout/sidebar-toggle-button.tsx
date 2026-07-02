"use client"

import { Menu } from "lucide-react"
import { useUiStore } from "@/stores"
import { Button } from "@/components/ui/button"

export function SidebarToggleButton() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle menu">
      <Menu className="size-5" />
    </Button>
  )
}
