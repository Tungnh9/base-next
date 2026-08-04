"use client"

import { useMemo, useState, type MouseEvent } from "react"
import { useTranslations } from "next-intl"
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
import { DatePicker } from "@/components/ui/date-picker"
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
import { useCustomerOptions, useResolveCustomerName } from "@/features/customers"
import { useEmployeeOptions, useResolveEmployeeName } from "@/features/employees"
import { useOpportunities } from "../hooks/use-opportunities"
import { formatContractValue, OPPORTUNITY_STATUSES } from "../constants"
import { STATUS_VARIANT, type SalesOpportunity, type OpportunityStatus } from "../types"

export function OpportunityList() {
  const t = useTranslations("salesOpportunities")
  const tNav = useTranslations("nav")
  const tCommon = useTranslations("common")
  const tEmployees = useTranslations("employees")
  const {
    opportunities,
    total,
    totalPages,
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    customerId,
    setCustomerId,
    salesRepId,
    setSalesRepId,
    status,
    setStatus,
    dateRange,
    setDateRange,
    isLoading,
    handleDelete,
    handleDeleteMany,
  } = useOpportunities()
  const { options: customerOptions } = useCustomerOptions()
  const { options: employeeOptions } = useEmployeeOptions()
  const resolveCustomerName = useResolveCustomerName()
  const resolveEmployeeName = useResolveEmployeeName()

  const [selectedRows, setSelectedRows] = useState<SalesOpportunity[]>([])
  const [pendingDelete, setPendingDelete] = useState<SalesOpportunity[] | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  // DataTable's internal rowSelection/sorting state is keyed by row index, not
  // row id — bumping this key forces a remount (fresh internal state) after
  // a delete refetches, so a stale index can't silently re-select the wrong row.
  const [tableKey, setTableKey] = useState(0)

  // Radix closes AlertDialog on Action click unless the event is prevented —
  // we need to await the delete first so it can't fire twice mid-flight.
  async function confirmDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (!pendingDelete || isDeleting) return
    setIsDeleting(true)
    const ids = pendingDelete.map((o) => o.id)
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

  const columns = useMemo<DataTableColumnDef<SalesOpportunity>[]>(
    () => [
      {
        id: "stt",
        header: t("columns.stt"),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-muted-foreground text-center">
            {(page - 1) * pageSize + row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: t("columns.name"),
        cell: ({ row }) => <span className="text-foreground font-medium">{row.original.name}</span>,
      },
      {
        id: "customer",
        header: t("columns.customer"),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {resolveCustomerName(row.original.customerId) ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "contractValue",
        header: t("columns.contractValue"),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatContractValue(row.original.contractValue)}
          </span>
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
        accessorKey: "status",
        header: t("columns.status"),
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status]} skin="light">
            {t(`status.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        id: "salesRep",
        header: t("columns.salesRep"),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {resolveEmployeeName(row.original.salesRepId) ?? "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-center">{t("columns.actions")}</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" aria-label={t("view")} disabled>
              <Eye className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={t("edit")} disabled>
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPendingDelete([row.original])}
              aria-label={t("delete")}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [t, page, pageSize, resolveCustomerName, resolveEmployeeName]
  )

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning" skin="light">
            {tNav("comingSoonBadge")}
          </Badge>
          <Button disabled>
            <Plus className="mr-1.5 size-4" />
            {t("addNew")}
          </Button>
        </div>
      </div>

      {/* Filter bar — Tìm kiếm → Khách hàng → NVKD → Trạng thái → Thời gian tạo */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Input
            className="sm:col-span-2"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={customerId ?? "all"}
            onValueChange={(v) => setCustomerId(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.customer")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              {customerOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                  <span className="text-muted-foreground">{` · ${option.code}`}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={salesRepId ?? "all"}
            onValueChange={(v) => setSalesRepId(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.salesRep")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              {employeeOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                  <span className="text-muted-foreground">
                    {` · ${tEmployees(`department.${option.department}`)}`}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status ?? "all"}
            onValueChange={(v) => setStatus(v === "all" ? undefined : (v as OpportunityStatus))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              {OPPORTUNITY_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            mode="range"
            className="w-full"
            value={dateRange}
            onChange={(v) => setDateRange(v as typeof dateRange)}
            placeholder={t("filters.createdRange")}
          />
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
        data={opportunities}
        isLoading={isLoading}
        selectable
        onSelectionChange={setSelectedRows}
        selectAllLabel={t("selectAll")}
        getRowSelectLabel={(opportunity) => t("selectRow", { name: opportunity.name })}
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
