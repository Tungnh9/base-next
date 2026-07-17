import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../hooks/use-customers")

import { CustomerList } from "../../components/customer-list"
import { useCustomers } from "../../hooks/use-customers"
import type { Customer } from "../../types"

const mockUseCustomers = vi.mocked(useCustomers)

const customers: Customer[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    email: "an@example.com",
    phone: "0901234567",
    company: "ABC",
    status: "active",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Lê Minh Châu",
    email: "chau@example.com",
    phone: "0923456789",
    company: "Startup Tech",
    status: "inactive",
    createdAt: "2024-03-10T00:00:00.000Z",
  },
]

describe("CustomerList — delete confirmation", () => {
  const handleDelete = vi.fn().mockResolvedValue(true)
  const handleDeleteMany = vi.fn().mockResolvedValue(true)

  beforeEach(() => {
    vi.clearAllMocks()
    handleDelete.mockResolvedValue(true)
    handleDeleteMany.mockResolvedValue(true)
    mockUseCustomers.mockReturnValue({
      customers,
      isLoading: false,
      refresh: vi.fn(),
      handleCreate: vi.fn(),
      handleUpdate: vi.fn(),
      handleDelete,
      handleDeleteMany,
    })
  })

  it("does not delete immediately — opens a confirm dialog first", async () => {
    const user = userEvent.setup()
    render(<CustomerList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])

    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    expect(handleDelete).not.toHaveBeenCalled()
  })

  it("cancel closes the dialog without deleting", async () => {
    const user = userEvent.setup()
    render(<CustomerList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])
    const dialog = screen.getByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "cancel" }))

    expect(handleDelete).not.toHaveBeenCalled()
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("confirming deletes the single selected customer", async () => {
    const user = userEvent.setup()
    render(<CustomerList />)

    await user.click(screen.getAllByRole("button", { name: "delete" })[0])
    const dialog = screen.getByRole("alertdialog")
    expect(within(dialog).getByText("confirmDelete")).toBeInTheDocument()
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
    expect(within(dialog).getByText("confirmDeleteMany")).toBeInTheDocument()
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
})
