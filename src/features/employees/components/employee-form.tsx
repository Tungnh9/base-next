"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createCreateEmployeeSchema, type CreateEmployeeFormValues } from "../schemas"
import type { Employee, EmployeeDepartment, EmployeeStatus } from "../types"

const DEPARTMENTS: EmployeeDepartment[] = [
  "engineering",
  "sales",
  "marketing",
  "hr",
  "finance",
  "support",
]
const STATUSES: EmployeeStatus[] = ["active", "inactive", "on-leave"]

interface EmployeeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
  onSubmit: (values: CreateEmployeeFormValues) => Promise<boolean>
}

export function EmployeeForm({ open, onOpenChange, employee, onSubmit }: EmployeeFormProps) {
  const t = useTranslations("employees")
  const tErrors = useTranslations("employees.errors")
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createCreateEmployeeSchema(tErrors)),
    defaultValues: { department: "engineering", status: "active" },
  })

  useEffect(() => {
    if (open) {
      reset(
        employee
          ? {
              name: employee.name,
              email: employee.email,
              phone: employee.phone,
              department: employee.department,
              position: employee.position,
              status: employee.status,
            }
          : {
              name: "",
              email: "",
              phone: "",
              department: "engineering",
              position: "",
              status: "active",
            }
      )
    }
  }, [open, employee, reset])

  async function onValid(values: CreateEmployeeFormValues) {
    const ok = await onSubmit(values)
    if (ok) onOpenChange(false)
  }

  // Radix calls onOpenChange for every close path — Cancel button, Esc,
  // overlay click, and the built-in X button — so intercepting here (rather
  // than only the Cancel button's onClick) is the only way to catch all of
  // them when there are unsaved changes.
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isDirty) {
      setShowDiscardConfirm(true)
      return
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-border border-b py-4">
          <DialogTitle>{employee ? t("form.titleEdit") : t("form.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4 px-6 py-5">
          <div className="grid gap-1.5">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input id="name" placeholder={t("form.namePlaceholder")} {...register("name")} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">{t("form.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("form.emailPlaceholder")}
              {...register("email")}
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="phone">{t("form.phone")}</Label>
              <Input id="phone" placeholder={t("form.phonePlaceholder")} {...register("phone")} />
              {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>{t("form.department")}</Label>
              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {t(`department.${d}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && (
                <p className="text-destructive text-xs">{errors.department.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="position">{t("form.position")}</Label>
              <Input
                id="position"
                placeholder={t("form.positionPlaceholder")}
                {...register("position")}
              />
              {errors.position && (
                <p className="text-destructive text-xs">{errors.position.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label>{t("form.status")}</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`status.${s}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-destructive text-xs">{errors.status.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t("form.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>

      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("form.discardTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("form.discardDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("form.discardCancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDiscardConfirm(false)
                onOpenChange(false)
              }}
            >
              {t("form.discardConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
