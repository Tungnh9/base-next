import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/use-customers")
// CustomerList always mounts CustomerForm (Radix only unmounts DialogContent
// while closed), so the form's real useEmployeeOptions() would otherwise fire
// on mount and call the getEmployeeOptions Server Action -> cookies(), which
// throws outside a request context in jsdom.
vi.mock("@/features/employees", () => ({
  useEmployeeOptions: vi.fn(() => ({ options: [], isLoading: false })),
}))

import { CustomerList } from "../../components/customer-list"
import { useCustomers } from "../../hooks/use-customers"
import type { Customer } from "../../types"

const mockUseCustomers = vi.mocked(useCustomers)

const customers: Customer[] = [
  {
    id: "1",
    code: "KH00001",
    name: "Nguyễn Văn An",
    email: "an@example.com",
    phone: "0901234567",
    company: "ABC",
    classification: "corporation",
    industry: "finance-banking",
    status: "collaborating",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    code: "KH00002",
    name: "Lê Minh Châu",
    email: "chau@example.com",
    phone: "0923456789",
    company: "Startup Tech",
    classification: "technology",
    industry: "ecommerce",
    status: "paused",
    createdAt: "2024-03-10T00:00:00.000Z",
  },
]

function baseHookReturn(overrides: Partial<ReturnType<typeof useCustomers>> = {}) {
  return {
    customers,
    total: 2,
    totalPages: 1,
    page: 1,
    setPage: vi.fn(),
    pageSize: 10,
    search: "",
    setSearch: vi.fn(),
    classification: undefined,
    setClassification: vi.fn(),
    industry: undefined,
    setIndustry: vi.fn(),
    status: undefined,
    setStatus: vi.fn(),
    isLoading: false,
    refresh: vi.fn(),
    handleCreate: vi.fn(),
    handleUpdate: vi.fn(),
    handleDelete: vi.fn().mockResolvedValue(true),
    handleDeleteMany: vi.fn().mockResolvedValue(true),
    ...overrides,
  }
}

describe("CustomerList", () => {
  let handleDelete: ReturnType<typeof vi.fn>
  let handleDeleteMany: ReturnType<typeof vi.fn>
  let setPage: ReturnType<typeof vi.fn>
  let setSearch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    handleDelete = vi.fn().mockResolvedValue(true)
    handleDeleteMany = vi.fn().mockResolvedValue(true)
    setPage = vi.fn()
    setSearch = vi.fn()
    mockUseCustomers.mockReturnValue(
      baseHookReturn({ handleDelete, handleDeleteMany, setPage, setSearch })
    )
  })

  it("renders every customer row", () => {
    render(<CustomerList />)

    expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument()
    expect(screen.getByText("Lê Minh Châu")).toBeInTheDocument()
  })

  it("renders the customer code as the first column", () => {
    render(<CustomerList />)

    expect(screen.getByText("KH00001")).toBeInTheDocument()
    expect(screen.getByText("KH00002")).toBeInTheDocument()
  })

  it("renders the classification, industry, and status filter selects, defaulted to 'all'", () => {
    render(<CustomerList />)

    const filterSelects = screen.getAllByRole("combobox")
    expect(filterSelects).toHaveLength(3)
    filterSelects.forEach((select) => expect(select).toHaveTextContent("filters.all"))
  })

  it("does not delete immediately — opens a confirm dialog first", async () => {
    const user = userEvent.setup()
    render(<CustomerList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])

    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    expect(handleDelete).not.toHaveBeenCalled()
  })

  it("confirming deletes the single selected customer", async () => {
    const user = userEvent.setup()
    render(<CustomerList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])
    const dialog = screen.getByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "delete" }))

    expect(handleDelete).toHaveBeenCalledWith("1")
    expect(handleDeleteMany).not.toHaveBeenCalled()
  })

  it("selecting multiple rows shows a bulk-delete action that confirms before deleting all", async () => {
    const user = userEvent.setup()
    render(<CustomerList />)

    const rowCheckboxes = screen.getAllByRole("checkbox", { name: "selectRow" })
    await user.click(rowCheckboxes[0])
    await user.click(rowCheckboxes[1])

    const bulkButton = screen.getByRole("button", { name: /deleteSelected/ })
    await user.click(bulkButton)

    const dialog = screen.getByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "delete" }))

    expect(handleDeleteMany).toHaveBeenCalledWith(["1", "2"])
    expect(handleDelete).not.toHaveBeenCalled()
  })

  it("select-all checkbox selects every row", async () => {
    const user = userEvent.setup()
    render(<CustomerList />)

    await user.click(screen.getByRole("checkbox", { name: "selectAll" }))

    const rowCheckboxes = screen.getAllByRole("checkbox", { name: "selectRow" })
    rowCheckboxes.forEach((checkbox) => expect(checkbox).toBeChecked())
  })

  it("the view icon and the customer name both link to the detail page", () => {
    render(<CustomerList />)

    const viewLinks = screen.getAllByRole("link", { name: "view" })
    expect(viewLinks[0]).toHaveAttribute("href", "/vi/customers/1")

    expect(screen.getByRole("link", { name: "Nguyễn Văn An" })).toHaveAttribute(
      "href",
      "/vi/customers/1"
    )
  })

  it("typing in the search box calls setSearch from the hook", async () => {
    const user = userEvent.setup()
    render(<CustomerList />)

    await user.type(screen.getByPlaceholderText("searchPlaceholder"), "a")

    expect(setSearch).toHaveBeenCalled()
  })

  it("disables the previous-page button on page 1 and enables next when more pages exist", () => {
    mockUseCustomers.mockReturnValue(
      baseHookReturn({ total: 24, totalPages: 3, page: 1, setPage, setSearch })
    )
    render(<CustomerList />)

    expect(screen.getByRole("button", { name: "pagination.previous" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "pagination.next" })).toBeEnabled()
  })

  it("clicking next-page calls setPage with page + 1", async () => {
    const user = userEvent.setup()
    mockUseCustomers.mockReturnValue(
      baseHookReturn({ total: 24, totalPages: 3, page: 1, setPage, setSearch })
    )
    render(<CustomerList />)

    await user.click(screen.getByRole("button", { name: "pagination.next" }))

    expect(setPage).toHaveBeenCalledWith(2)
  })

  it("disables the next-page button on the last page", () => {
    mockUseCustomers.mockReturnValue(
      baseHookReturn({ total: 24, totalPages: 3, page: 3, setPage, setSearch })
    )
    render(<CustomerList />)

    expect(screen.getByRole("button", { name: "pagination.next" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "pagination.previous" })).toBeEnabled()
  })
})
