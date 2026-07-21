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
import { createCustomerSchema, type CreateCustomerFormValues } from "../schemas"
import type { Customer } from "../types"

interface CustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSubmit: (values: CreateCustomerFormValues) => Promise<boolean>
}

export function CustomerForm({ open, onOpenChange, customer, onSubmit }: CustomerFormProps) {
  const t = useTranslations("customers")
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: { status: "active" },
  })

  useEffect(() => {
    if (open) {
      reset(
        customer
          ? {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              company: customer.company,
              status: customer.status,
            }
          : { name: "", email: "", phone: "", company: "", status: "active" }
      )
    }
  }, [open, customer, reset])

  async function onValid(values: CreateCustomerFormValues) {
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
          <DialogTitle>{customer ? t("form.titleEdit") : t("form.title")}</DialogTitle>
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
                      <SelectItem value="active">{t("status.active")}</SelectItem>
                      <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-destructive text-xs">{errors.status.message}</p>}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="company">{t("form.company")}</Label>
            <Input
              id="company"
              placeholder={t("form.companyPlaceholder")}
              {...register("company")}
            />
            {errors.company && <p className="text-destructive text-xs">{errors.company.message}</p>}
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
