"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <Label htmlFor="status">{t("form.status")}</Label>
              <select
                id="status"
                {...register("status")}
                className="border-input bg-background text-foreground focus:border-primary focus:ring-ring/50 h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-[3px]"
              >
                <option value="active">{t("status.active")}</option>
                <option value="inactive">{t("status.inactive")}</option>
              </select>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("form.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t("form.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
