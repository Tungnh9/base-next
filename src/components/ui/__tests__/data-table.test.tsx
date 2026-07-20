import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { DataTable, type DataTableColumnDef } from "../data-table"

interface Row {
  id: string
  name: string
}

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
]

const rows: Row[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
]

function paginationProps(overrides: Partial<Parameters<typeof DataTable>[0]["pagination"]> = {}) {
  return {
    page: 1,
    totalPages: 3,
    pageSize: 10,
    onPageChange: () => {},
    previousLabel: "Previous",
    nextLabel: "Next",
    ...overrides,
  }
}

describe("DataTable", () => {
  it("renders real rows when not loading", () => {
    render(<DataTable columns={columns} data={rows} />)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("renders the empty message when there is no data and not loading", () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here" />)

    expect(screen.getByText("Nothing here")).toBeInTheDocument()
  })

  it("renders pageSize skeleton rows instead of data/emptyMessage while isLoading, even with real data present", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={rows}
        isLoading
        emptyMessage="Nothing here"
        pagination={paginationProps({ pageSize: 4 })}
      />
    )

    expect(screen.queryByText("Alice")).not.toBeInTheDocument()
    expect(screen.queryByText("Nothing here")).not.toBeInTheDocument()
    const skeletonRows = container.querySelectorAll("tbody tr")
    expect(skeletonRows).toHaveLength(4)
  })

  it("falls back to 5 skeleton rows when loading without pagination", () => {
    const { container } = render(<DataTable columns={columns} data={[]} isLoading />)

    expect(container.querySelectorAll("tbody tr")).toHaveLength(5)
  })

  it("reserves tbody min-height when the current page has fewer rows than pageSize", () => {
    const { container } = render(
      <DataTable columns={columns} data={rows} pagination={paginationProps({ pageSize: 10 })} />
    )

    const tbody = container.querySelector("tbody")
    expect(tbody?.style.minHeight).toBe("27.5rem")
  })

  it("does not reserve min-height when the page is full", () => {
    const { container } = render(
      <DataTable columns={columns} data={rows} pagination={paginationProps({ pageSize: 2 })} />
    )

    const tbody = container.querySelector("tbody")
    expect(tbody?.style.minHeight).toBe("")
  })

  it("does not reserve min-height while loading, even on a short page", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={rows}
        isLoading
        pagination={paginationProps({ pageSize: 10 })}
      />
    )

    const tbody = container.querySelector("tbody")
    expect(tbody?.style.minHeight).toBe("")
  })
})
