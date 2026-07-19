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
  /** Aria-label for the header "select all" checkbox (only used when selectable) */
  selectAllLabel?: string
  /** Aria-label for each row's checkbox, given its data (only used when selectable) */
  getRowSelectLabel?: (row: TData) => string
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
  selectAllLabel = "Select all",
  getRowSelectLabel = () => "Select row",
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  // Read via a ref (not a dependency) so this only re-fires when the
  // selection itself changes — depending on `data` directly would re-fire on
  // every render whenever a caller passes a non-memoized array (e.g. an
  // inline `isLoading ? [] : rows` ternary), an infinite loop since
  // onSelectionChange([]) triggers a parent state update every time.
  const dataRef = React.useRef(data)
  React.useEffect(() => {
    dataRef.current = data
  })

  React.useEffect(() => {
    if (!onSelectionChange) return
    const selected = Object.keys(rowSelection)
      .filter((k) => rowSelection[k])
      .map((k) => dataRef.current[Number(k)])
      .filter(Boolean)
    onSelectionChange(selected)
    // onSelectionChange intentionally excluded — including it would let a new
    // inline callback identity from the caller re-fire this on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  // Prepend selection column when selectable — memoized so its object/array
  // identity stays stable across renders (a fresh columns array every render
  // was defeating @tanstack/react-table's row-model memoization).
  const allColumns = React.useMemo<ColumnDef<TData>[]>(() => {
    if (!selectable) return columns
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
          aria-label={selectAllLabel}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label={getRowSelectLabel(row.original)}
        />
      ),
      enableSorting: false,
    }
    return [selectionColumn, ...columns]
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectAllLabel/getRowSelectLabel intentionally excluded: recreating the whole column set just because a label string changed identity would defeat the memoization this fixes
  }, [selectable, columns])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
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
            <TableRow key={row.id} data-selected={row.getIsSelected()}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(cell.column.id === "__select__" && "w-10 pr-3")}
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
