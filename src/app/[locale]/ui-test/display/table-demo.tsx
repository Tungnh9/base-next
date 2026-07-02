"use client"

import { useState } from "react"
import { Trash2, MoreVertical, Pencil } from "lucide-react"
import {
  Table, TableHeader, TableBody, TableFooter,
  TableRow, TableHead, TableCell, TableCaption,
  type TableHeaderProps,
} from "@/components/ui/table"
import { DataTable, type DataTableColumnDef } from "@/components/ui/data-table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ─── Shared mock data ─────────────────────────────────────────────────────────

const ORDERS = [
  { id: "1", product: "OnePlus 7Pro", brand: "OnePlus", image: "", date: "10 Mar 2022", category: "Smart Phone", buyer: "Joseph Wheeler", payment: "$120/408", payStatus: "Partially Paid", status: "Confirmed" },
  { id: "2", product: "Magic Mouse",  brand: "Apple",   image: "", date: "26 Mar 2022", category: "Mouse",       buyer: "May Lloyd",      payment: "$149",      payStatus: "",             status: "Confirmed" },
  { id: "3", product: "iMac Pro",     brand: "Apple",   image: "", date: "2 Apr 2022",  category: "Computer",   buyer: "Julia Schuster", payment: "$899",      payStatus: "Shared",       status: "Cancelled" },
  { id: "4", product: "Note 10",      brand: "Samsung", image: "", date: "25 Apr 2022", category: "Smart Phone", buyer: "Elizabeth Snyder",payment: "$149",     payStatus: "",             status: "Completed" },
  { id: "5", product: "MI LED TV 4X", brand: "Xiaomi",  image: "", date: "6 Jun 2022",  category: "Smart TV",   buyer: "Marvin Ramos",   payment: "$399",      payStatus: "Fully Paid",   status: "Confirmed" },
] as const

const STATUS_BADGE: Record<string, { variant: "success" | "danger" | "primary"; label: string }> = {
  Confirmed:  { variant: "primary", label: "Confirmed" },
  Cancelled:  { variant: "danger",  label: "Cancelled" },
  Completed:  { variant: "success", label: "Completed" },
}

// ─── Basic Table demo ─────────────────────────────────────────────────────────

function SortableTableDemo({ headerVariant = "default" }: { headerVariant?: TableHeaderProps["variant"] }) {
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortCol(col)
      setSortDir("asc")
    }
  }

  const dir = (col: string) =>
    sortCol === col ? sortDir : false

  return (
    <Table striped bordered>
      <TableHeader variant={headerVariant}>
        <TableRow className="hover:bg-transparent">
          <TableHead sortDirection={dir("product")} onSort={() => toggleSort("product")}>Product</TableHead>
          <TableHead sortDirection={dir("date")}    onSort={() => toggleSort("date")}>Date</TableHead>
          <TableHead sortDirection={dir("category")} onSort={() => toggleSort("category")}>Category</TableHead>
          <TableHead sortDirection={dir("buyer")}   onSort={() => toggleSort("buyer")}>Buyers</TableHead>
          <TableHead sortDirection={dir("payment")} onSort={() => toggleSort("payment")}>Payment</TableHead>
          <TableHead sortDirection={dir("status")}  onSort={() => toggleSort("status")}>Order Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {ORDERS.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-foreground">{row.product}</span>
                <span className="text-xs text-muted-foreground">{row.brand}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{row.date}</TableCell>
            <TableCell>{row.category}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar size={26}>
                  <AvatarFallback>{row.buyer.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="leading-none">{row.buyer}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col leading-tight">
                <span className="font-medium">{row.payment}</span>
                {row.payStatus && <span className="text-xs text-muted-foreground">{row.payStatus}</span>}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={STATUS_BADGE[row.status]?.variant ?? "primary"}
                skin="light"
              >
                {row.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5} className="text-muted-foreground">5 orders total</TableCell>
          <TableCell colSpan={2} />
        </TableRow>
      </TableFooter>
    </Table>
  )
}

// ─── DataTable demo ───────────────────────────────────────────────────────────

type Employee = {
  id: string
  name: string
  role: string
  email: string
  date: string
  salary: number
  status: "Current" | "Resigned" | "Applied" | "Rejected"
  avatar?: string
  initials: string
  avatarColor: string
}

const EMPLOYEES: Employee[] = [
  { id: "1", name: "Edgar Jones",    role: "Systems Administrator", email: "Herminia47@hotmail.com", date: "04/22/2016", salary: 17550.18, status: "Current",  initials: "EJ", avatarColor: "#EA5455" },
  { id: "2", name: "Linnie Summers", role: "Programmer",            email: "Hal_Murazik@hotmail.com",  date: "04/25/2018", salary: 13304.45, status: "Resigned", initials: "LS", avatarColor: "#FF9F43" },
  { id: "3", name: "Carlos Daniels", role: "Paralegal",             email: "Madelyn81@hotmail.com",    date: "04/04/2019", salary: 19653.56, status: "Applied",  initials: "CD", avatarColor: "#7367F0" },
  { id: "4", name: "Isabelle Cole",  role: "Research Associate",    email: "Joy47@hotmail.com",        date: "04/09/2019", salary: 15211.60, status: "Resigned", initials: "IC", avatarColor: "#FF9F43" },
  { id: "5", name: "Jason Simpson",  role: "Operator",              email: "Owen_Hayes@gmail.com",     date: "05/13/2018", salary: 10089.96, status: "Rejected", initials: "JS", avatarColor: "#7367F0" },
  { id: "6", name: "Ruth Hampton",   role: "Senior Sales Associate",email: "Janet86@hotmail.com",      date: "07/23/2018", salary: 23024.28, status: "Current",  initials: "RH", avatarColor: "#28C76F" },
]

const STATUS_MAP: Record<Employee["status"], { variant: "info" | "warning" | "success" | "danger" }> = {
  Current:  { variant: "info" },
  Resigned: { variant: "warning" },
  Applied:  { variant: "success" },
  Rejected: { variant: "danger" },
}

const EMPLOYEE_COLUMNS: DataTableColumnDef<Employee>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Header",
    enableSorting: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar size={38}>
          <AvatarImage src={row.original.avatar} />
          <AvatarFallback
            style={{ backgroundColor: row.original.avatarColor + "26", color: row.original.avatarColor }}
          >
            {row.original.initials}
          </AvatarFallback>
        </Avatar>
        <span className="flex flex-col leading-tight">
          <span className="font-medium text-foreground">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.role}</span>
        </span>
      </div>
    ),
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Date",
    enableSorting: true,
  },
  {
    id: "salary",
    accessorKey: "salary",
    header: "Salary",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium">
        ${row.original.salary.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => (
      <Badge
        variant={STATUS_MAP[row.original.status].variant}
        skin="light"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
          <MoreVertical className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
          <Pencil className="size-4" />
        </Button>
      </div>
    ),
  },
]

// ─── Export ───────────────────────────────────────────────────────────────────

export function TableDemo() {
  const [selected, setSelected] = useState<Employee[]>([])

  return (
    <section className="flex flex-col gap-16">
      <h4>Table</h4>

      {/* Basic */}
      <div className="flex flex-col gap-3">
        <h6>Basic — Striped + Sortable</h6>
        <SortableTableDemo />
      </div>

      {/* Dark header */}
      <div className="flex flex-col gap-3">
        <h6>Dark Header</h6>
        <SortableTableDemo headerVariant="dark" />
      </div>

      {/* Density */}
      <div className="flex flex-col gap-3">
        <h6>Density — Compact</h6>
        <Table striped bordered density="compact">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ORDERS.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.product}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[row.status]?.variant ?? "primary"} skin="light">{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* No stripe */}
      <div className="flex flex-col gap-3">
        <h6>Without Stripe</h6>
        <Table bordered>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ORDERS.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.product}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[row.status]?.variant ?? "primary"} skin="light">
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>A simple product order list.</TableCaption>
        </Table>
      </div>

      <h4>Data Table</h4>

      {/* DataTable with selection */}
      <div className="flex flex-col gap-3">
        <h6>With Row Selection + Sorting</h6>
        {selected.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {selected.length} row{selected.length > 1 ? "s" : ""} selected
          </p>
        )}
        <DataTable
          columns={EMPLOYEE_COLUMNS}
          data={EMPLOYEES}
          selectable
          onSelectionChange={setSelected}
          striped
        />
      </div>

      {/* DataTable without selection */}
      <div className="flex flex-col gap-3">
        <h6>Without Selection</h6>
        <DataTable
          columns={EMPLOYEE_COLUMNS.slice(0, 4)}
          data={EMPLOYEES}
          striped
        />
      </div>
    </section>
  )
}
