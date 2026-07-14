"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomers } from "../hooks/use-customers"
import { CustomerForm } from "./customer-form"
import type { Customer } from "../types"
import type { CreateCustomerFormValues } from "../schemas"

export function CustomerList() {
  const t = useTranslations("customers")
  const { customers, isLoading, handleCreate, handleUpdate, handleDelete } = useCustomers()

  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

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

      {/* Search */}
      <Input
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Table */}
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-border border-b">
            <tr>
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
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted-foreground py-12 text-center">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="text-muted-foreground px-4 py-3">{customer.email}</td>
                  <td className="text-muted-foreground px-4 py-3">{customer.phone}</td>
                  <td className="text-muted-foreground px-4 py-3">{customer.company}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={customer.status === "active" ? "success" : "secondary"}
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
                        onClick={() => handleDelete(customer.id)}
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
    </div>
  )
}
