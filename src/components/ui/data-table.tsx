"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

export type { ColumnDef as DataTableColumnDef }

export interface DataTablePaginationProps {
  /** 1-based current page — matches PaginatedResponse.page, not TanStack's 0-based index */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  previousLabel: string
  nextLabel: string
  /** Pre-formatted by the caller (e.g. via next-intl) — DataTable renders it as-is */
  summary?: string
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  /** Enable row checkboxes for multi-selection */
  selectable?: boolean
  /** Callback fired when selection changes (array of selected rows) */
  onSelectionChange?: (rows: TData[]) => void
  /** Zebra-stripe even rows (default: true) */
  striped?: boolean
  /** Highlight rows on hover (default: true) */
  hoverable?: boolean
  /** Wrap in a bordered card container (default: true) */
  bordered?: boolean
  /** Message shown when data is empty */
  emptyMessage?: string
  /** Server-side pagination controls — omit for an unpaginated table */
  pagination?: DataTablePaginationProps
  className?: string
}

// ─── DataTable ────────────────────────────────────────────────────────────────

function DataTable<TData>({
  columns,
  data,
  selectable = false,
  onSelectionChange,
  striped = true,
  hoverable = true,
  bordered = true,
  emptyMessage = "No results.",
  pagination,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  // Prepend selection column when selectable
  const selectionColumn: ColumnDef<TData> = {
    id: "__select__",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  }

  const allColumns: ColumnDef<TData>[] = selectable ? [selectionColumn, ...columns] : columns

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater
      setRowSelection(next)
      if (onSelectionChange) {
        const selected = Object.keys(next)
          .filter((k) => next[k])
          .map((k) => data[Number(k)])
          .filter(Boolean)
        onSelectionChange(selected)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: selectable,
  })

  return (
    <Table striped={striped} hoverable={hoverable} bordered={bordered} className={className}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort()
              const sorted = header.column.getIsSorted()

              return (
                <TableHead
                  key={header.id}
                  className={cn(header.column.id === "__select__" && "w-10 pr-3")}
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="hover:text-foreground inline-flex items-center gap-1 transition-colors focus-visible:outline-none"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sorted === "asc" ? (
                        <ChevronUp className="text-primary size-3.5" />
                      ) : sorted === "desc" ? (
                        <ChevronDown className="text-primary size-3.5" />
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-50" />
                      )}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-selected={row.getIsSelected()}
              onClick={() => selectable && row.toggleSelected()}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(cell.column.id === "__select__" && "w-10 pr-3")}
                  onClick={cell.column.id === "__select__" ? (e) => e.stopPropagation() : undefined}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={allColumns.length}
              className="text-muted-foreground h-24 text-center"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>

      {pagination && (
        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={allColumns.length}>
              <div className="flex items-center justify-between gap-3">
                {pagination.summary ? (
                  <span className="text-muted-foreground text-xs">{pagination.summary}</span>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={pagination.previousLabel}
                    disabled={pagination.page <= 1}
                    onClick={() => pagination.onPageChange(pagination.page - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={pagination.nextLabel}
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => pagination.onPageChange(pagination.page + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  )
}

export { DataTable }
export type { DataTableProps }
