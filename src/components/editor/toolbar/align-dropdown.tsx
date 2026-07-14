"use client"

import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AlignDropdownProps {
  editor: Editor
}

export function AlignDropdown({ editor }: AlignDropdownProps) {
  const t = useTranslations("editor")

  const ALIGN_OPTIONS = [
    { value: "left", label: t("toolbar.alignLeft"), icon: AlignLeft },
    { value: "center", label: t("toolbar.alignCenter"), icon: AlignCenter },
    { value: "right", label: t("toolbar.alignRight"), icon: AlignRight },
    { value: "justify", label: t("toolbar.alignJustify"), icon: AlignJustify },
  ] as const

  const active =
    ALIGN_OPTIONS.find((o) => editor.isActive({ textAlign: o.value })) ?? ALIGN_OPTIONS[0]
  const ActiveIcon = active.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-0.5 px-1.5 text-xs"
          aria-label={active.label}
        >
          <ActiveIcon className="size-3.5" />
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[150px]">
        {ALIGN_OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive = editor.isActive({ textAlign: option.value })
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => editor.chain().focus().setTextAlign(option.value).run()}
              data-active={isActive || undefined}
              className={cn("gap-2", "data-[active]:text-primary data-[active]:font-medium")}
            >
              <Icon className="size-3.5" />
              {option.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
