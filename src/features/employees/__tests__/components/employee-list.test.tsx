import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/use-employees")

import { EmployeeList } from "../../components/employee-list"
import { useEmployees } from "../../hooks/use-employees"
import type { Employee } from "../../types"

const mockUseEmployees = vi.mocked(useEmployees)

const employees: Employee[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    email: "an@example.com",
    phone: "0901234567",
    department: "engineering",
    position: "Frontend Engineer",
    status: "active",
    joinedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Lê Minh Châu",
    email: "chau@example.com",
    phone: "0923456789",
    department: "sales",
    position: "Sales Executive",
    status: "inactive",
    joinedAt: "2024-03-10T00:00:00.000Z",
  },
]

describe("EmployeeList", () => {
  const handleDelete = vi.fn().mockResolvedValue(true)
  const handleDeleteMany = vi.fn().mockResolvedValue(true)
  const setPage = vi.fn()
  const setSearch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    handleDelete.mockResolvedValue(true)
    handleDeleteMany.mockResolvedValue(true)
    mockUseEmployees.mockReturnValue({
      employees,
      total: 2,
      totalPages: 1,
      page: 1,
      setPage,
      pageSize: 10,
      search: "",
      setSearch,
      isLoading: false,
      refresh: vi.fn(),
      handleCreate: vi.fn(),
      handleUpdate: vi.fn(),
      handleDelete,
      handleDeleteMany,
    })
  })

  it("renders every employee row", () => {
    render(<EmployeeList />)

    expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument()
    expect(screen.getByText("Lê Minh Châu")).toBeInTheDocument()
  })

  it("does not delete immediately — opens a confirm dialog first", async () => {
    const user = userEvent.setup()
    render(<EmployeeList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])

    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    expect(handleDelete).not.toHaveBeenCalled()
  })

  it("cancel closes the dialog without deleting", async () => {
    const user = userEvent.setup()
    render(<EmployeeList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])
    const dialog = screen.getByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "cancel" }))

    expect(handleDelete).not.toHaveBeenCalled()
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("confirming deletes the single selected employee", async () => {
    const user = userEvent.setup()
    render(<EmployeeList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])
    const dialog = screen.getByRole("alertdialog")
    expect(within(dialog).getByText("confirmDelete")).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "delete" }))

    expect(handleDelete).toHaveBeenCalledWith("1")
    expect(handleDeleteMany).not.toHaveBeenCalled()
  })

  it("selecting multiple rows shows a bulk-delete action that confirms before deleting all", async () => {
    const user = userEvent.setup()
    render(<EmployeeList />)

    const rowCheckboxes = screen.getAllByRole("checkbox", { name: "selectRow" })
    await user.click(rowCheckboxes[0])
    await user.click(rowCheckboxes[1])

    const bulkButton = screen.getByRole("button", { name: /deleteSelected/ })
    await user.click(bulkButton)

    const dialog = screen.getByRole("alertdialog")
    expect(within(dialog).getByText("confirmDeleteMany")).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "delete" }))

    expect(handleDeleteMany).toHaveBeenCalledWith(["1", "2"])
    expect(handleDelete).not.toHaveBeenCalled()
  })

  it("select-all checkbox selects every row", async () => {
    const user = userEvent.setup()
    render(<EmployeeList />)

    await user.click(screen.getByRole("checkbox", { name: "selectAll" }))

    const rowCheckboxes = screen.getAllByRole("checkbox", { name: "selectRow" })
    rowCheckboxes.forEach((checkbox) => expect(checkbox).toBeChecked())
  })

  it("the view icon and the employee name both link to the detail page", () => {
    render(<EmployeeList />)

    const viewLinks = screen.getAllByRole("link", { name: "view" })
    expect(viewLinks[0]).toHaveAttribute("href", "/vi/employees/1")

    expect(screen.getByRole("link", { name: "Nguyễn Văn An" })).toHaveAttribute(
      "href",
      "/vi/employees/1"
    )
  })

  it("typing in the search box calls setSearch from the hook", async () => {
    const user = userEvent.setup()
    render(<EmployeeList />)

    await user.type(screen.getByPlaceholderText("searchPlaceholder"), "a")

    expect(setSearch).toHaveBeenCalled()
  })

  it("disables the previous-page button on page 1 and enables next when more pages exist", () => {
    mockUseEmployees.mockReturnValue({
      employees,
      total: 24,
      totalPages: 3,
      page: 1,
      setPage,
      pageSize: 10,
      search: "",
      setSearch,
      isLoading: false,
      refresh: vi.fn(),
      handleCreate: vi.fn(),
      handleUpdate: vi.fn(),
      handleDelete,
      handleDeleteMany,
    })
    render(<EmployeeList />)

    expect(screen.getByRole("button", { name: "pagination.previous" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "pagination.next" })).toBeEnabled()
  })

  it("clicking next-page calls setPage with page + 1", async () => {
    const user = userEvent.setup()
    mockUseEmployees.mockReturnValue({
      employees,
      total: 24,
      totalPages: 3,
      page: 1,
      setPage,
      pageSize: 10,
      search: "",
      setSearch,
      isLoading: false,
      refresh: vi.fn(),
      handleCreate: vi.fn(),
      handleUpdate: vi.fn(),
      handleDelete,
      handleDeleteMany,
    })
    render(<EmployeeList />)

    await user.click(screen.getByRole("button", { name: "pagination.next" }))

    expect(setPage).toHaveBeenCalledWith(2)
  })

  it("disables the next-page button on the last page", () => {
    mockUseEmployees.mockReturnValue({
      employees,
      total: 24,
      totalPages: 3,
      page: 3,
      setPage,
      pageSize: 10,
      search: "",
      setSearch,
      isLoading: false,
      refresh: vi.fn(),
      handleCreate: vi.fn(),
      handleUpdate: vi.fn(),
      handleDelete,
      handleDeleteMany,
    })
    render(<EmployeeList />)

    expect(screen.getByRole("button", { name: "pagination.next" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "pagination.previous" })).toBeEnabled()
  })
})
