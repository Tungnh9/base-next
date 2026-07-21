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
import { updateEmployee, deleteEmployee } from "../actions"
import { EmployeeForm } from "./employee-form"
import { STATUS_VARIANT, type Employee } from "../types"
import type { CreateEmployeeFormValues } from "../schemas"

interface EmployeeDetailProps {
  employee: Employee
}

export function EmployeeDetail({ employee: initialEmployee }: EmployeeDetailProps) {
  const t = useTranslations("employees")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const router = useRouter()

  const [employee, setEmployee] = useState(initialEmployee)
  const [formOpen, setFormOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function onFormSubmit(values: CreateEmployeeFormValues) {
    const { data, error } = await updateEmployee(employee.id, values)
    if (error) {
      toast.error(error.message)
      return false
    }
    setEmployee(data)
    toast.success(t("toast.updateSuccess"))
    return true
  }

  // Radix closes AlertDialog on Action click unless the event is prevented —
  // we need to await the delete first so it can't fire twice mid-flight.
  async function confirmDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (isDeleting) return
    setIsDeleting(true)
    const { error } = await deleteEmployee(employee.id)
    if (error) {
      toast.error(error.message)
      setIsDeleting(false)
      return
    }
    toast.success(t("toast.deleteSuccess"))
    router.push(`/${locale}${ROUTES.employees}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}${ROUTES.employees}`}
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Link>

      <div className="border-border bg-card rounded-xl border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar size={64}>
              <AvatarFallback>{employee.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-foreground text-xl font-semibold">{employee.name}</h1>
              <Badge variant={STATUS_VARIANT[employee.status]} skin="light" className="mt-1.5">
                {t(`status.${employee.status}`)}
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
            <dd className="mt-1 text-sm">{employee.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t("columns.phone")}</dt>
            <dd className="mt-1 text-sm">{employee.phone}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t("columns.department")}</dt>
            <dd className="mt-1 text-sm">{t(`department.${employee.department}`)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t("columns.position")}</dt>
            <dd className="mt-1 text-sm">{employee.position}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">{t("columns.joinedAt")}</dt>
            <dd className="mt-1 text-sm">
              {new Date(employee.joinedAt).toLocaleDateString("vi-VN")}
            </dd>
          </div>
        </dl>
      </div>

      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={employee}
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
                name: employee.name,
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
