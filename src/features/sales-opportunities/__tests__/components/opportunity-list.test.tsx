import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/use-opportunities")
vi.mock("@/features/customers", () => ({
  useCustomerOptions: vi.fn(() => ({ options: [], isLoading: false })),
  useResolveCustomerName: vi.fn(() => () => undefined),
}))
vi.mock("@/features/employees", () => ({
  useEmployeeOptions: vi.fn(() => ({ options: [], isLoading: false })),
  useResolveEmployeeName: vi.fn(() => () => undefined),
}))
// The real DatePicker's calendar UI belongs to a shared component tested on
// its own — stubbing it here keeps this suite focused on OpportunityList's
// own wiring (does it forward DatePicker's onChange to setDateRange?).
vi.mock("@/components/ui/date-picker", () => ({
  DatePicker: ({ onChange }: { onChange?: (v: unknown) => void }) => (
    <button onClick={() => onChange?.({ from: new Date(2024, 0, 1), to: new Date(2024, 0, 31) })}>
      mock-date-picker
    </button>
  ),
}))

import { OpportunityList } from "../../components/opportunity-list"
import { useOpportunities } from "../../hooks/use-opportunities"
import { useCustomerOptions, useResolveCustomerName } from "@/features/customers"
import { useEmployeeOptions, useResolveEmployeeName } from "@/features/employees"
import type { SalesOpportunity } from "../../types"

const mockUseOpportunities = vi.mocked(useOpportunities)
const mockUseCustomerOptions = vi.mocked(useCustomerOptions)
const mockUseResolveCustomerName = vi.mocked(useResolveCustomerName)
const mockUseEmployeeOptions = vi.mocked(useEmployeeOptions)
const mockUseResolveEmployeeName = vi.mocked(useResolveEmployeeName)

const opportunities: SalesOpportunity[] = [
  {
    id: "1",
    name: "Deal A",
    customerId: "1",
    contractValue: 1_500_000_000,
    salesRepId: "1",
    status: "processing",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Deal B",
    customerId: "2",
    contractValue: 500_000_000,
    salesRepId: "2",
    status: "transferred",
    createdAt: "2024-03-10T00:00:00.000Z",
  },
]

function baseHookReturn(overrides: Partial<ReturnType<typeof useOpportunities>> = {}) {
  return {
    opportunities,
    total: 2,
    totalPages: 1,
    page: 1,
    setPage: vi.fn(),
    pageSize: 10,
    search: "",
    setSearch: vi.fn(),
    customerId: undefined,
    setCustomerId: vi.fn(),
    salesRepId: undefined,
    setSalesRepId: vi.fn(),
    status: undefined,
    setStatus: vi.fn(),
    dateRange: undefined,
    setDateRange: vi.fn(),
    isLoading: false,
    refresh: vi.fn(),
    handleDelete: vi.fn().mockResolvedValue(true),
    handleDeleteMany: vi.fn().mockResolvedValue(true),
    ...overrides,
  }
}

describe("OpportunityList", () => {
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
    mockUseOpportunities.mockReturnValue(
      baseHookReturn({ handleDelete, handleDeleteMany, setPage, setSearch })
    )
    mockUseCustomerOptions.mockReturnValue({ options: [], isLoading: false })
    mockUseEmployeeOptions.mockReturnValue({ options: [], isLoading: false })
    mockUseResolveCustomerName.mockReturnValue(() => undefined)
    mockUseResolveEmployeeName.mockReturnValue(() => undefined)
  })

  it("renders every opportunity row", () => {
    render(<OpportunityList />)

    expect(screen.getByText("Deal A")).toBeInTheDocument()
    expect(screen.getByText("Deal B")).toBeInTheDocument()
  })

  it("renders a sequential STT column starting from 1 on the first page", () => {
    render(<OpportunityList />)

    const rows = screen.getAllByRole("row")
    // rows[0] is the header row; the STT cell is index 1 (after the select checkbox).
    expect(within(rows[1]).getAllByRole("cell")[1]).toHaveTextContent("1")
    expect(within(rows[2]).getAllByRole("cell")[1]).toHaveTextContent("2")
  })

  it("offsets STT by the current page so numbering stays sequential across pages", () => {
    mockUseOpportunities.mockReturnValue(
      baseHookReturn({ page: 2, pageSize: 10, total: 12, totalPages: 2, setPage, setSearch })
    )
    render(<OpportunityList />)

    const rows = screen.getAllByRole("row")
    expect(within(rows[1]).getAllByRole("cell")[1]).toHaveTextContent("11")
    expect(within(rows[2]).getAllByRole("cell")[1]).toHaveTextContent("12")
  })

  it("formats the contract value as VND currency", () => {
    render(<OpportunityList />)

    expect(screen.getByText("1.500.000.000 ₫")).toBeInTheDocument()
    expect(screen.getByText("500.000.000 ₫")).toBeInTheDocument()
  })

  it("resolves the customer and NVKD columns to a dash when not resolvable", () => {
    render(<OpportunityList />)

    const dashes = screen.getAllByText("—")
    // 2 rows x 2 resolved columns (customer, salesRep) = 4 dashes
    expect(dashes.length).toBe(4)
  })

  it("resolves the customer and NVKD columns to their real names once loaded", () => {
    mockUseResolveCustomerName.mockReturnValue((id) => (id === "1" ? "Khách hàng A" : undefined))
    mockUseResolveEmployeeName.mockReturnValue((id) => (id === "1" ? "Nhân viên A" : undefined))
    render(<OpportunityList />)

    expect(screen.getByText("Khách hàng A")).toBeInTheDocument()
    expect(screen.getByText("Nhân viên A")).toBeInTheDocument()
  })

  it("shows a centered header label for the actions column", () => {
    render(<OpportunityList />)

    const header = screen.getByRole("columnheader", { name: "columns.actions" })
    expect(header).toBeInTheDocument()
    expect(header.firstChild).toHaveClass("text-center")
  })

  it("renders the customer, NVKD, and status filter selects, defaulted to 'all'", () => {
    render(<OpportunityList />)

    const filterSelects = screen.getAllByRole("combobox")
    expect(filterSelects).toHaveLength(3)
    filterSelects.forEach((select) => expect(select).toHaveTextContent("filters.all"))
  })

  it("disables the view and edit action buttons — no detail/edit page yet", () => {
    render(<OpportunityList />)

    screen.getAllByRole("button", { name: "view" }).forEach((btn) => expect(btn).toBeDisabled())
    screen.getAllByRole("button", { name: "edit" }).forEach((btn) => expect(btn).toBeDisabled())
  })

  it("keeps the delete action enabled", () => {
    render(<OpportunityList />)

    screen
      .getAllByRole("button", { name: "delete" })
      .forEach((btn) => expect(btn).not.toBeDisabled())
  })

  it("disables the 'Thêm mới' button and shows the coming-soon badge", () => {
    render(<OpportunityList />)

    expect(screen.getByRole("button", { name: /addNew/ })).toBeDisabled()
    expect(screen.getByText("comingSoonBadge")).toBeInTheDocument()
  })

  it("does not delete immediately — opens a confirm dialog first", async () => {
    const user = userEvent.setup()
    render(<OpportunityList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])

    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    expect(handleDelete).not.toHaveBeenCalled()
  })

  it("confirming deletes the single selected opportunity", async () => {
    const user = userEvent.setup()
    render(<OpportunityList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])
    const dialog = screen.getByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "delete" }))

    expect(handleDelete).toHaveBeenCalledWith("1")
    expect(handleDeleteMany).not.toHaveBeenCalled()
  })

  it("selecting multiple rows shows a bulk-delete action that confirms before deleting all", async () => {
    const user = userEvent.setup()
    render(<OpportunityList />)

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
    render(<OpportunityList />)

    await user.click(screen.getByRole("checkbox", { name: "selectAll" }))

    const rowCheckboxes = screen.getAllByRole("checkbox", { name: "selectRow" })
    rowCheckboxes.forEach((checkbox) => expect(checkbox).toBeChecked())
  })

  it("typing in the search box calls setSearch from the hook", async () => {
    const user = userEvent.setup()
    render(<OpportunityList />)

    await user.type(screen.getByPlaceholderText("searchPlaceholder"), "a")

    expect(setSearch).toHaveBeenCalled()
  })

  it("renders the empty message when there are no opportunities", () => {
    mockUseOpportunities.mockReturnValue(
      baseHookReturn({ opportunities: [], total: 0, totalPages: 1, setPage, setSearch })
    )
    render(<OpportunityList />)

    expect(screen.getByText("empty")).toBeInTheDocument()
  })

  it("disables the previous-page button on page 1 and enables next when more pages exist", () => {
    mockUseOpportunities.mockReturnValue(
      baseHookReturn({ total: 24, totalPages: 3, page: 1, setPage, setSearch })
    )
    render(<OpportunityList />)

    expect(screen.getByRole("button", { name: "pagination.previous" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "pagination.next" })).toBeEnabled()
  })

  it("clicking next-page calls setPage with page + 1", async () => {
    const user = userEvent.setup()
    mockUseOpportunities.mockReturnValue(
      baseHookReturn({ total: 24, totalPages: 3, page: 1, setPage, setSearch })
    )
    render(<OpportunityList />)

    await user.click(screen.getByRole("button", { name: "pagination.next" }))

    expect(setPage).toHaveBeenCalledWith(2)
  })

  it("selecting a real customer option calls setCustomerId with its id", async () => {
    const user = userEvent.setup()
    const setCustomerId = vi.fn()
    mockUseOpportunities.mockReturnValue(baseHookReturn({ setCustomerId, setPage, setSearch }))
    mockUseCustomerOptions.mockReturnValue({
      options: [{ id: "1", name: "Công ty A", code: "2VT-C00001" }],
      isLoading: false,
    })
    render(<OpportunityList />)

    await user.click(screen.getAllByRole("combobox")[0])
    await user.click(screen.getByRole("option", { name: /Công ty A/ }))

    expect(setCustomerId).toHaveBeenCalledWith("1")
  })

  it("resetting the customer filter back to 'all' calls setCustomerId with undefined", async () => {
    const user = userEvent.setup()
    const setCustomerId = vi.fn()
    // Starts already filtered by a real customer so the "all" item is a
    // genuine change — Radix's Select only fires onValueChange when the
    // clicked item differs from the current controlled value.
    mockUseOpportunities.mockReturnValue(
      baseHookReturn({ customerId: "1", setCustomerId, setPage, setSearch })
    )
    mockUseCustomerOptions.mockReturnValue({
      options: [{ id: "1", name: "Công ty A", code: "2VT-C00001" }],
      isLoading: false,
    })
    render(<OpportunityList />)

    await user.click(screen.getAllByRole("combobox")[0])
    await user.click(screen.getByRole("option", { name: "filters.all" }))

    expect(setCustomerId).toHaveBeenCalledWith(undefined)
  })

  it("selecting a real NVKD option calls setSalesRepId with its id", async () => {
    const user = userEvent.setup()
    const setSalesRepId = vi.fn()
    mockUseOpportunities.mockReturnValue(baseHookReturn({ setSalesRepId, setPage, setSearch }))
    mockUseEmployeeOptions.mockReturnValue({
      options: [{ id: "1", name: "Nguyễn Văn An", department: "sales" }],
      isLoading: false,
    })
    render(<OpportunityList />)

    await user.click(screen.getAllByRole("combobox")[1])
    await user.click(screen.getByRole("option", { name: /Nguyễn Văn An/ }))

    expect(setSalesRepId).toHaveBeenCalledWith("1")
  })

  it("selecting a status option calls setStatus with it", async () => {
    const user = userEvent.setup()
    const setStatus = vi.fn()
    mockUseOpportunities.mockReturnValue(baseHookReturn({ setStatus, setPage, setSearch }))
    render(<OpportunityList />)

    await user.click(screen.getAllByRole("combobox")[2])
    await user.click(screen.getByRole("option", { name: "status.processing" }))

    expect(setStatus).toHaveBeenCalledWith("processing")
  })

  it("resetting the status filter back to 'all' calls setStatus with undefined", async () => {
    const user = userEvent.setup()
    const setStatus = vi.fn()
    // Starts already filtered by a real status so the "all" item is a
    // genuine change — Radix's Select only fires onValueChange when the
    // clicked item differs from the current controlled value.
    mockUseOpportunities.mockReturnValue(
      baseHookReturn({ status: "processing", setStatus, setPage, setSearch })
    )
    render(<OpportunityList />)

    await user.click(screen.getAllByRole("combobox")[2])
    await user.click(screen.getByRole("option", { name: "filters.all" }))

    expect(setStatus).toHaveBeenCalledWith(undefined)
  })

  it("picking a date range forwards it to setDateRange", async () => {
    const user = userEvent.setup()
    const setDateRange = vi.fn()
    mockUseOpportunities.mockReturnValue(baseHookReturn({ setDateRange, setPage, setSearch }))
    render(<OpportunityList />)

    await user.click(screen.getByRole("button", { name: "mock-date-picker" }))

    expect(setDateRange).toHaveBeenCalledWith({
      from: new Date(2024, 0, 1),
      to: new Date(2024, 0, 31),
    })
  })

  it("clicking Cancel closes the confirm dialog without deleting", async () => {
    const user = userEvent.setup()
    render(<OpportunityList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])
    const dialog = screen.getByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "cancel" }))

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    expect(handleDelete).not.toHaveBeenCalled()
  })
})
