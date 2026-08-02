"use client"

import { useTranslations } from "next-intl"
import { Check } from "lucide-react"
import { toast } from "sonner"

import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkflowConfig } from "../hooks/use-workflow-config"
import { StageDetail } from "./stage-detail"
import { StageRow } from "./stage-row"

function WorkflowCard() {
  const t = useTranslations("settings.workflow")
  const {
    stages,
    addState,
    removeState,
    updateStateName,
    updateStateColor,
    addAction,
    removeAction,
    updateActionLabel,
    updateActionType,
    updateActionTarget,
  } = useWorkflowConfig()

  const handleSave = () => {
    toast.success(t("saveToast"))
  }

  return (
    <Card>
      <CardHeader className="justify-between gap-4">
        <div>
          <CardTitle>{t("cardTitle", { count: stages.length })}</CardTitle>
          <CardDescription>{t("cardDescription")}</CardDescription>
        </div>
        <Button type="button" onClick={handleSave}>
          <Check className="mr-1.5 size-4" />
          {t("saveButton")}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="single" collapsible variant="advance" className="rounded-none border-x-0">
          {stages.map((stage) => (
            <AccordionItem key={stage.id} value={stage.id}>
              <StageRow stage={stage} />
              <AccordionContent>
                <StageDetail
                  stage={stage}
                  onAddState={() => addState(stage.id)}
                  onRemoveState={(stateId) => removeState(stage.id, stateId)}
                  onUpdateStateName={(stateId, name) => updateStateName(stage.id, stateId, name)}
                  onUpdateStateColor={(stateId, color) =>
                    updateStateColor(stage.id, stateId, color)
                  }
                  onAddAction={() => addAction(stage.id)}
                  onRemoveAction={(actionId) => removeAction(stage.id, actionId)}
                  onUpdateActionLabel={(actionId, label) =>
                    updateActionLabel(stage.id, actionId, label)
                  }
                  onUpdateActionType={(actionId, type) =>
                    updateActionType(stage.id, actionId, type)
                  }
                  onUpdateActionTarget={(actionId, targetStateId) =>
                    updateActionTarget(stage.id, actionId, targetStateId)
                  }
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

export { WorkflowCard }
