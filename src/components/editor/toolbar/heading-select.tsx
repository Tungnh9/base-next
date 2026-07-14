"use client"

import { type Editor } from "@tiptap/react"
import { useTranslations } from "next-intl"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface HeadingSelectProps {
  editor: Editor
}

export function HeadingSelect({ editor }: HeadingSelectProps) {
  const t = useTranslations("editor")

  const BLOCK_OPTIONS = [
    {
      label: t("heading.paragraph"),
      action: (e: Editor) => e.chain().focus().setParagraph().run(),
      isActive: (e: Editor) => e.isActive("paragraph") && !e.isActive("heading"),
    },
    {
      label: t("heading.h1"),
      action: (e: Editor) => e.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: (e: Editor) => e.isActive("heading", { level: 1 }),
    },
    {
      label: t("heading.h2"),
      action: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e: Editor) => e.isActive("heading", { level: 2 }),
    },
    {
      label: t("heading.h3"),
      action: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e: Editor) => e.isActive("heading", { level: 3 }),
    },
    {
      label: t("heading.h4"),
      action: (e: Editor) => e.chain().focus().toggleHeading({ level: 4 }).run(),
      isActive: (e: Editor) => e.isActive("heading", { level: 4 }),
    },
  ]

  const activeLabel = BLOCK_OPTIONS.find((o) => o.isActive(editor))?.label ?? t("heading.paragraph")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 min-w-[110px] justify-between gap-1 px-2 text-xs"
        >
          <span>{activeLabel}</span>
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[130px]">
        {BLOCK_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.label}
            onSelect={() => option.action(editor)}
            data-active={option.isActive(editor) || undefined}
            className="data-[active]:text-primary data-[active]:font-medium"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
