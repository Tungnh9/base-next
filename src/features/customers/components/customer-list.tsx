"use client"

import { useState, type MouseEvent } from "react"
import { useTranslations } from "next-intl"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useCustomers } from "../hooks/use-customers"
import { CustomerForm } from "./customer-form"
import type { Customer } from "../types"
import type { CreateCustomerFormValues } from "../schemas"

export function CustomerList() {
  const t = useTranslations("customers")
  const tCommon = useTranslations("common")
  const { customers, isLoading, handleCreate, handleUpdate, handleDelete, handleDeleteMany } =
    useCustomers()

  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<Customer[] | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  const allSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))
  const someSelected = filtered.some((c) => selectedIds.has(c.id))

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(filtered.map((c) => c.id)))
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(customer: Customer) {
    setEditing(customer)
    setFormOpen(true)
  }

  async function onFormSubmit(values: CreateCustomerFormValues) {
    if (editing) return handleUpdate(editing.id, values)
    return handleCreate(values)
  }

  // Radix closes AlertDialog on Action click unless the event is prevented —
  // we need to await the delete first so it can't fire twice mid-flight.
  async function confirmDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (!pendingDelete || isDeleting) return
    setIsDeleting(true)
    const ids = pendingDelete.map((c) => c.id)
    if (ids.length === 1) {
      await handleDelete(ids[0])
    } else {
      await handleDeleteMany(ids)
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
    setIsDeleting(false)
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{t("description")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 size-4" />
          {t("addNew")}
        </Button>
      </div>

      {/* Search + bulk action bar */}
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {someSelected && (
          <Button
            variant="destructive"
            skin="light"
            onClick={() => setPendingDelete(filtered.filter((c) => selectedIds.has(c.id)))}
          >
            <Trash2 className="mr-1.5 size-4" />
            {t("deleteSelected", { count: selectedIds.size })}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-border border-b">
            <tr>
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleSelectAll}
                  disabled={filtered.length === 0}
                  aria-label={t("selectAll")}
                />
              </th>
              {(["name", "email", "phone", "company", "status", "createdAt"] as const).map(
                (col) => (
                  <th key={col} className="text-muted-foreground px-4 py-3 text-left font-medium">
                    {t(`columns.${col}`)}
                  </th>
                )
              )}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted-foreground py-12 text-center">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(customer.id)}
                      onCheckedChange={() => toggleSelectRow(customer.id)}
                      aria-label={t("selectRow", { name: customer.name })}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="text-muted-foreground px-4 py-3">{customer.email}</td>
                  <td className="text-muted-foreground px-4 py-3">{customer.phone}</td>
                  <td className="text-muted-foreground px-4 py-3">{customer.company}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={customer.status === "active" ? "success" : "danger"}
                      skin="light"
                    >
                      {t(`status.${customer.status}`)}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(customer)}
                        aria-label={t("edit")}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPendingDelete([customer])}
                        aria-label={t("delete")}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editing}
        onSubmit={onFormSubmit}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && !isDeleting && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && pendingDelete.length > 1
                ? t("confirmDeleteMany", { count: pendingDelete.length })
                : pendingDelete &&
                  t.rich("confirmDelete", {
                    name: pendingDelete[0].name,
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
