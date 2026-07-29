"use client"

import { type MouseEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
import { cn } from "@/lib/utils"
import { updateCustomer, deleteCustomer } from "../actions"
import { useResolveEmployeeName } from "@/features/employees"
import { CustomerForm } from "./customer-form"
import { STATUS_VARIANT, type Customer } from "../types"
import type { CreateCustomerFormValues } from "../schemas"

interface CustomerDetailProps {
  customer: Customer
}

function dash(value?: string) {
  return value && value.trim() ? value : "—"
}

function DetailItem({
  label,
  value,
  multiline,
}: {
  label: string
  value?: string
  multiline?: boolean
}) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className={cn("mt-1 text-sm break-words", multiline && "whitespace-pre-line")}>
        {dash(value)}
      </dd>
    </div>
  )
}

export function CustomerDetail({ customer: initialCustomer }: CustomerDetailProps) {
  const t = useTranslations("customers")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const router = useRouter()
  // Module-scope cache in the underlying useEmployeeOptions() hook means
  // this costs no extra network round-trip if CustomerForm (rendered below
  // for the edit dialog) already fetched the same options on this page.
  const resolveEmployeeName = useResolveEmployeeName()

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
              {/* avatarUrl is always undefined in mock mode (no object storage
                  exists to produce one) — this branch is ready for a real
                  backend without any further wiring. */}
              {customer.avatarUrl && <AvatarImage src={customer.avatarUrl} alt={customer.name} />}
              <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-foreground text-xl font-semibold">{customer.name}</h1>
              <Badge variant={STATUS_VARIANT[customer.status]} skin="light" className="mt-1.5">
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

        <div className="mt-6 flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="text-foreground text-sm font-semibold">{t("form.sectionGeneral")}</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label={t("columns.code")} value={customer.code} />
              <DetailItem label={t("form.shortName")} value={customer.shortName} />
              <DetailItem label={t("columns.email")} value={customer.email} />
              <DetailItem label={t("columns.phone")} value={customer.phone} />
              <DetailItem label={t("columns.company")} value={customer.company} />
              <DetailItem
                label={t("columns.classification")}
                value={t(`classification.${customer.classification}`)}
              />
              <DetailItem
                label={t("columns.industry")}
                value={t(`industry.${customer.industry}`)}
              />
              <DetailItem label={t("form.taxCode")} value={customer.taxCode} />
              <DetailItem label={t("form.website")} value={customer.website} />
              <DetailItem label={t("form.address")} value={customer.address} />
              <DetailItem
                label={t("form.country")}
                value={customer.country ? t(`country.${customer.country}`) : undefined}
              />
              <DetailItem
                label={t("form.province")}
                value={customer.province ? t(`province.${customer.province}`) : undefined}
              />
              <DetailItem
                label={t("form.salesRep")}
                value={resolveEmployeeName(customer.salesRepId)}
              />
              <DetailItem
                label={t("form.contractManager")}
                value={resolveEmployeeName(customer.contractManagerId)}
              />
              <DetailItem
                label={t("columns.createdAt")}
                value={new Date(customer.createdAt).toLocaleDateString("vi-VN")}
              />
            </dl>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-foreground text-sm font-semibold">{t("form.sectionContacts")}</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
              <DetailItem
                label={t("form.representativeName")}
                value={customer.representativeName}
              />
              <DetailItem label={t("form.contactName")} value={customer.contactName} />
              <DetailItem label={t("form.mediaContactName")} value={customer.mediaContactName} />
              <DetailItem
                label={t("form.representativePosition")}
                value={customer.representativePosition}
              />
              <DetailItem label={t("form.contactPosition")} value={customer.contactPosition} />
              <DetailItem
                label={t("form.mediaContactPosition")}
                value={customer.mediaContactPosition}
              />
              <DetailItem
                label={t("form.representativeMobile")}
                value={customer.representativeMobile}
              />
              <DetailItem label={t("form.contactMobile")} value={customer.contactMobile} />
              <DetailItem
                label={t("form.mediaContactMobile")}
                value={customer.mediaContactMobile}
              />
              <DetailItem
                label={t("form.representativeEmail")}
                value={customer.representativeEmail}
              />
              <DetailItem label={t("form.contactEmail")} value={customer.contactEmail} />
              <DetailItem label={t("form.mediaContactEmail")} value={customer.mediaContactEmail} />
            </dl>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-foreground text-sm font-semibold">{t("form.sectionMedia")}</h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4">
              <DetailItem label={t("form.avatar")} value={customer.avatarFileName} />
            </dl>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
              <DetailItem label={t("form.notes")} value={customer.notes} multiline />
              <DetailItem label={t("form.review")} value={customer.review} multiline />
            </dl>
          </section>
        </div>
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
