"use client"

import { useMemo, useState, type MouseEvent } from "react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { useEmployees } from "../hooks/use-employees"
import { EmployeeForm } from "./employee-form"
import type { Employee, EmployeeStatus } from "../types"
import type { CreateEmployeeFormValues } from "../schemas"

// Stable reference for the loading-state placeholder — a fresh `[]` literal
// every render would give DataTable a new `data` array identity each time.
const EMPTY_EMPLOYEES: Employee[] = []

const STATUS_BADGE_VARIANT: Record<EmployeeStatus, "success" | "danger" | "warning"> = {
  active: "success",
  inactive: "danger",
  "on-leave": "warning",
}

export function EmployeeList() {
  const t = useTranslations("employees")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const {
    employees,
    total,
    totalPages,
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleDeleteMany,
  } = useEmployees()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [selectedRows, setSelectedRows] = useState<Employee[]>([])
  const [pendingDelete, setPendingDelete] = useState<Employee[] | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  // DataTable's internal rowSelection/sorting state is keyed by row index, not
  // row id — bumping this key forces a remount (fresh internal state) after
  // a delete refetches, so a stale index can't silently re-select the wrong row.
  const [tableKey, setTableKey] = useState(0)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  async function onFormSubmit(values: CreateEmployeeFormValues) {
    if (editing) return handleUpdate(editing.id, values)
    return handleCreate(values)
  }

  // Radix closes AlertDialog on Action click unless the event is prevented —
  // we need to await the delete first so it can't fire twice mid-flight.
  async function confirmDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (!pendingDelete || isDeleting) return
    setIsDeleting(true)
    const ids = pendingDelete.map((e) => e.id)
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

  const columns = useMemo<DataTableColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("columns.name"),
        cell: ({ row }) => (
          <Link
            href={`/${locale}${ROUTES.employees}/${row.original.id}`}
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
        accessorKey: "department",
        header: t("columns.department"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {t(`department.${row.original.department}`)}
          </span>
        ),
      },
      {
        accessorKey: "position",
        header: t("columns.position"),
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.position}</span>,
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE_VARIANT[row.original.status]} skin="light">
            {t(`status.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        accessorKey: "joinedAt",
        header: t("columns.joinedAt"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {new Date(row.original.joinedAt).toLocaleDateString("vi-VN")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const employee = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="icon" aria-label={t("view")} asChild>
                <Link href={`/${locale}${ROUTES.employees}/${employee.id}`}>
                  <Eye className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing(employee)
                  setFormOpen(true)
                }}
                aria-label={t("edit")}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPendingDelete([employee])}
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

      {/* Search + bulk action bar */}
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {selectedRows.length > 0 && (
          <Button variant="destructive" skin="light" onClick={() => setPendingDelete(selectedRows)}>
            <Trash2 className="mr-1.5 size-4" />
            {t("deleteSelected", { count: selectedRows.length })}
          </Button>
        )}
      </div>

      <DataTable
        key={tableKey}
        columns={columns}
        data={isLoading ? EMPTY_EMPLOYEES : employees}
        selectable
        onSelectionChange={setSelectedRows}
        selectAllLabel={t("selectAll")}
        getRowSelectLabel={(employee) => t("selectRow", { name: employee.name })}
        emptyMessage={isLoading ? tCommon("loading") : t("empty")}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          previousLabel: t("pagination.previous"),
          nextLabel: t("pagination.next"),
          summary: t("pagination.summary", { from, to, total }),
        }}
      />

      <EmployeeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={editing}
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
