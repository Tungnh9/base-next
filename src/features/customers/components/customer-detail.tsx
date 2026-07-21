"use client"

import { type MouseEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { ROUTES } from "@/lib/constants"
import { updateCustomer, deleteCustomer } from "../actions"
import { CustomerForm } from "./customer-form"
import type { Customer } from "../types"
import type { CreateCustomerFormValues } from "../schemas"

interface CustomerDetailProps {
  customer: Customer
}

export function CustomerDetail({ customer: initialCustomer }: CustomerDetailProps) {
  const t = useTranslations("customers")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const router = useRouter()

  const [customer, setCustomer] = useState(initialCustomer)
  const [formOpen, setFormOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function onFormSubmit(values: CreateCustomerFormValues) {
    const { data, error } = await updateCustomer(customer.id, values)
    if (error) {
      toast.error(error.message)
      return false
    }
    setCustomer(data)
    toast.success(t("toast.updateSuccess"))
    return true
  }

  // Radix closes AlertDialog on Action click unless the event is prevented —
  // we need to await the delete first so it can't fire twice mid-flight.
  async function confirmDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (isDeleting) return
    setIsDeleting(true)
    const { error } = await deleteCustomer(customer.id)
    if (error) {
      toast.error(error.message)
      setIsDeleting(false)
      return
    }
    toast.success(t("toast.deleteSuccess"))
    router.push(`/${locale}${ROUTES.customers}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}${ROUTES.customers}`}
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>

      <div className="border-border bg-card rounded-xl border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar size={64}>
              <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-foreground text-xl font-semibold">{customer.name}</h1>
              <Badge
                variant={customer.status === "active" ? "success" : "danger"}
                skin="light"
                className="mt-1.5"
              >
                {t(`status.${customer.status}`)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setFormOpen(true)}>
              <Pencil className="mr-1.5 size-4" />
              {t("edit")}
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setPendingDelete(true)}
            >
              <Trash2 className="mr-1.5 size-4" />
              {t("delete")}
            </Button>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-muted-foreground text-xs">{t("columns.email")}</dt>
            <dd className="mt-1 text-sm">{customer.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t("columns.phone")}</dt>
            <dd className="mt-1 text-sm">{customer.phone}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t("columns.company")}</dt>
            <dd className="mt-1 text-sm">{customer.company}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t("columns.createdAt")}</dt>
            <dd className="mt-1 text-sm">
              {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
            </dd>
          </div>
        </dl>
      </div>

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={customer}
        onSubmit={onFormSubmit}
      />

      <AlertDialog
        open={pendingDelete}
        onOpenChange={(open) => !open && !isDeleting && setPendingDelete(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.rich("confirmDelete", {
                name: customer.name,
                b: (chunks) => <b className="text-foreground font-semibold">{chunks}</b>,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
