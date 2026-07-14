import * as React from "react"
import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Context ──────────────────────────────────────────────────────────────────

interface TableContextValue {
  striped?: boolean
  hoverable?: boolean
  density?: "compact" | "default" | "comfortable"
}
const TableContext = React.createContext<TableContextValue>({})

// ─── Table ────────────────────────────────────────────────────────────────────

interface TableProps extends React.ComponentProps<"table"> {
  /** Zebra-stripe even rows */
  striped?: boolean
  /** Highlight row on hover (default: true) */
  hoverable?: boolean
  /** Wrap in a bordered, rounded card container */
  bordered?: boolean
  /** Row density — affects cell padding */
  density?: "compact" | "default" | "comfortable"
}

function Table({
  className,
  striped,
  hoverable = true,
  bordered,
  density = "default",
  ...props
}: TableProps) {
  return (
    <TableContext.Provider value={{ striped, hoverable, density }}>
      <div
        className={cn(
          "relative w-full overflow-x-auto",
          bordered && "rounded-xl border border-border",
        )}
      >
        <table
          data-slot="table"
          data-density={density}
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    </TableContext.Provider>
  )
}

// ─── TableHeader ──────────────────────────────────────────────────────────────

interface TableHeaderProps extends React.ComponentProps<"thead"> {
  /** "default" = border-bottom only | "dark" = filled dark bg with white text */
  variant?: "default" | "dark"
}

function TableHeader({ className, variant = "default", ...props }: TableHeaderProps) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "border-b border-border",
        variant === "dark" && [
          "bg-foreground border-foreground",
          "[&_th]:text-background [&_th]:border-foreground",
          "[&_button:hover]:text-background/80",
        ],
        className,
      )}
      {...props}
    />
  )
}

// ─── TableBody ────────────────────────────────────────────────────────────────

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  const { striped, hoverable } = React.useContext(TableContext)
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0",
        striped && "[&_tr:nth-child(even)]:bg-muted",
        hoverable && "[&_tr]:transition-colors [&_tr]:hover:bg-muted/80",
        className,
      )}
      {...props}
    />
  )
}

// ─── TableFooter ──────────────────────────────────────────────────────────────

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-border bg-muted/50 font-medium [&_tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  )
}

// ─── TableRow ─────────────────────────────────────────────────────────────────

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors",
        "data-[selected=true]:bg-primary/5 data-[selected=true]:hover:bg-primary/10",
        className,
      )}
      {...props}
    />
  )
}

// ─── TableHead ────────────────────────────────────────────────────────────────

interface TableHeadProps extends React.ComponentProps<"th"> {
  /** Show a sort trigger; pass "asc" | "desc" | false for current state */
  sortDirection?: "asc" | "desc" | false
  onSort?: () => void
}

function TableHead({ className, children, sortDirection, onSort, ...props }: TableHeadProps) {
  const { density } = React.useContext(TableContext)
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
        density === "compact"      ? "h-9"  : density === "comfortable" ? "h-14" : "h-11",
        "[&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-3",
        className,
      )}
      {...props}
    >
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors focus-visible:outline-none"
        >
          {children}
          {sortDirection === "asc" ? (
            <ChevronUp className="size-3.5 text-primary" />
          ) : sortDirection === "desc" ? (
            <ChevronDown className="size-3.5 text-primary" />
          ) : (
            <ChevronsUpDown className="size-3.5 opacity-50" />
          )}
        </button>
      ) : (
        children
      )}
    </th>
  )
}

// ─── TableCell ────────────────────────────────────────────────────────────────

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const { density } = React.useContext(TableContext)
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 align-middle whitespace-nowrap",
        density === "compact"      ? "py-1.5" : density === "comfortable" ? "py-5" : "py-3",
        "[&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-3",
        className,
      )}
      {...props}
    />
  )
}

// ─── TableCaption ─────────────────────────────────────────────────────────────

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("py-3 px-4 text-sm text-muted-foreground text-center", className)}
      {...props}
    />
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
export type { TableProps, TableHeadProps, TableHeaderProps }
