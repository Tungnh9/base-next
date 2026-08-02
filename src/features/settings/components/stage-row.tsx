"use client"

import { useTranslations } from "next-intl"
import { ChevronDown, Pencil } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { COLOR_VARIANT_CLASSES } from "@/components/ui/color-variants"
import type { WorkflowStage } from "../types"

interface StageRowProps {
  stage: WorkflowStage
}

// AccordionPrimitive.Trigger renders a real <button>. The collapsed/expanded
// affordance needs to *look* like a Button ("Cấu hình" / "Thu gọn"), but a
// <Button> nested inside would produce <button><button/></button> — invalid
// HTML and broken click semantics. So this row composes the trigger directly
// from radix-ui primitives (mirroring src/components/ui/accordion.tsx's own
// "advance" styling) and renders the two labels as buttonVariants()-styled
// <span>s that swap via the trigger's own data-state, no React state needed.
function StageRow({ stage }: StageRowProps) {
  const tNav = useTranslations("nav")
  const t = useTranslations("settings.workflow")

  const exampleState = stage.states[0]?.name
  const subtitle = exampleState
    ? t("stageSubtitle", {
        example: exampleState,
        statesCount: stage.states.length,
        actionsCount: stage.actions.length,
      })
    : t("stageSubtitleEmpty", {
        statesCount: stage.states.length,
        actionsCount: stage.actions.length,
      })

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="stage-row-trigger"
        className="group/trigger hover:bg-foreground/5 data-[state=open]:bg-foreground/8 flex flex-1 cursor-pointer items-center gap-4 px-6 py-4 text-left transition-colors"
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
            COLOR_VARIANT_CLASSES.primary
          )}
        >
          {stage.order}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-foreground block text-[15px] font-semibold">{tNav(stage.key)}</span>
          <span className="text-muted-foreground block text-sm">{subtitle}</span>
        </span>
        <Badge variant={stage.enabled ? "success" : "secondary"} skin="light" className="shrink-0">
          {stage.enabled ? t("enabledBadge") : t("disabledBadge")}
        </Badge>
        <span
          aria-hidden="true"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "pointer-events-none shrink-0 group-data-[state=open]/trigger:hidden"
          )}
        >
          <Pencil className="size-[14px]" />
          {t("configureButton")}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "pointer-events-none hidden shrink-0 group-data-[state=open]/trigger:inline-flex"
          )}
        >
          <ChevronDown className="size-[14px]" />
          {t("collapseButton")}
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export { StageRow }
