"use client"

import { useMemo, useState, type MouseEvent } from "react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { DataTable, type DataTableColumnDef } from "@/components/ui/data-table"
import { ROUTES } from "@/lib/constants"
import { useCustomers } from "../hooks/use-customers"
import { CustomerForm } from "./customer-form"
import { CUSTOMER_CLASSIFICATIONS, CUSTOMER_INDUSTRIES, CUSTOMER_STATUSES } from "../constants"
import {
  STATUS_VARIANT,
  type Customer,
  type CustomerClassification,
  type CustomerIndustry,
  type CustomerStatus,
} from "../types"
import type { CreateCustomerFormValues } from "../schemas"

export function CustomerList() {
  const t = useTranslations("customers")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const {
    customers,
    total,
    totalPages,
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    classification,
    setClassification,
    industry,
    setIndustry,
    status,
    setStatus,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleDeleteMany,
  } = useCustomers()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [selectedRows, setSelectedRows] = useState<Customer[]>([])
  const [pendingDelete, setPendingDelete] = useState<Customer[] | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  // DataTable's internal rowSelection/sorting state is keyed by row index, not
  // row id — bumping this key forces a remount (fresh internal state) after
  // a delete refetches, so a stale index can't silently re-select the wrong row.
  const [tableKey, setTableKey] = useState(0)

  function openCreate() {
    setEditing(null)
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
    setSelectedRows([])
    setTableKey((k) => k + 1)
    setIsDeleting(false)
    setPendingDelete(null)
  }

  const columns = useMemo<DataTableColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "code",
        header: t("columns.code"),
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-xs">{row.original.code}</span>
        ),
      },
      {
        accessorKey: "name",
        header: t("columns.name"),
        cell: ({ row }) => (
          <Link
            href={`/${locale}${ROUTES.customers}/${row.original.id}`}
            className="hover:text-primary font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "email",
        header: t("columns.email"),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
      },
      {
        accessorKey: "phone",
        header: t("columns.phone"),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone}</span>,
      },
      {
        accessorKey: "company",
        header: t("columns.company"),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.company}</span>,
      },
      {
        accessorKey: "classification",
        header: t("columns.classification"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {t(`classification.${row.original.classification}`)}
          </span>
        ),
      },
      {
        accessorKey: "industry",
        header: t("columns.industry"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{t(`industry.${row.original.industry}`)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status]} skin="light">
            {t(`status.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("columns.createdAt"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="icon" aria-label={t("view")} asChild>
                <Link href={`/${locale}${ROUTES.customers}/${customer.id}`}>
                  <Eye className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing(customer)
                  setFormOpen(true)
                }}
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
          )
        },
      },
    ],
    [t, locale]
  )

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

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

      {/* Filter bar — 4 fields share the row equally instead of sizing to content */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={classification ?? "all"}
            onValueChange={(v) =>
              setClassification(v === "all" ? undefined : (v as CustomerClassification))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.classification")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              {CUSTOMER_CLASSIFICATIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {t(`classification.${c}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={industry ?? "all"}
            onValueChange={(v) => setIndustry(v === "all" ? undefined : (v as CustomerIndustry))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.industry")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              {CUSTOMER_INDUSTRIES.map((i) => (
                <SelectItem key={i} value={i}>
                  {t(`industry.${i}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status ?? "all"}
            onValueChange={(v) => setStatus(v === "all" ? undefined : (v as CustomerStatus))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              {CUSTOMER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedRows.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="destructive"
              skin="light"
              onClick={() => setPendingDelete(selectedRows)}
            >
              <Trash2 className="mr-1.5 size-4" />
              {t("deleteSelected", { count: selectedRows.length })}
            </Button>
          </div>
        )}
      </div>

      <DataTable
        key={tableKey}
        columns={columns}
        data={customers}
        isLoading={isLoading}
        selectable
        onSelectionChange={setSelectedRows}
        selectAllLabel={t("selectAll")}
        getRowSelectLabel={(customer) => t("selectRow", { name: customer.name })}
        emptyMessage={t("empty")}
        pagination={{
          page,
          totalPages,
          pageSize,
          onPageChange: setPage,
          previousLabel: t("pagination.previous"),
          nextLabel: t("pagination.next"),
          summary: t("pagination.summary", { from, to, total }),
        }}
      />

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
