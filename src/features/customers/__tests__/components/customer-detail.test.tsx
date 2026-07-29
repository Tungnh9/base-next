import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/vi/customers/1",
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

vi.mock("../../actions", () => ({
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
}))

// CustomerDetail renders CustomerForm (for the edit dialog) and resolves
// assignee names via useEmployeeOptions() — without this mock, the real hook
// would call the getEmployeeOptions Server Action -> cookies(), which throws
// outside a request context in jsdom.
vi.mock("@/features/employees", () => ({
  useEmployeeOptions: vi.fn(() => ({ options: [], isLoading: false })),
}))

import { CustomerDetail } from "../../components/customer-detail"
import { updateCustomer, deleteCustomer } from "../../actions"
import { useEmployeeOptions } from "@/features/employees"
import { toast } from "sonner"
import type { Customer } from "../../types"

const mockUpdateCustomer = vi.mocked(updateCustomer)
const mockDeleteCustomer = vi.mocked(deleteCustomer)
const mockUseEmployeeOptions = vi.mocked(useEmployeeOptions)
const mockToastSuccess = vi.mocked(toast.success)

const customer: Customer = {
  id: "1",
  code: "KH00001",
  opportunityCount: 0,
  name: "Nguyễn Văn An",
  email: "an@example.com",
  phone: "0901234567",
  company: "ABC",
  classification: "corporation",
  industry: "finance-banking",
  status: "collaborating",
  shortName: "SVG",
  taxCode: "0123456789",
  salesRepId: "1",
  contractManagerId: "2",
  createdAt: "2024-01-15T00:00:00.000Z",
}

describe("CustomerDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pushMock.mockClear()
    mockUseEmployeeOptions.mockReturnValue({ options: [], isLoading: false })
  })

  it("renders the customer's info", () => {
    render(<CustomerDetail customer={customer} />)

    expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument()
    expect(screen.getByText("an@example.com")).toBeInTheDocument()
    expect(screen.getByText("0901234567")).toBeInTheDocument()
    expect(screen.getByText("ABC")).toBeInTheDocument()
  })

  it("renders an em dash for absent optional fields", () => {
    render(<CustomerDetail customer={customer} />)

    expect(screen.getAllByText("—").length).toBeGreaterThan(0)
  })

  it("resolves the assigned NVKD/QLHĐ names from employee options", () => {
    mockUseEmployeeOptions.mockReturnValue({
      options: [
        { id: "1", name: "Trần Thị B", department: "sales" },
        { id: "2", name: "Lê Văn C", department: "engineering" },
      ],
      isLoading: false,
    })
    render(<CustomerDetail customer={{ ...customer, salesRepId: "1", contractManagerId: "2" }} />)

    expect(screen.getByText("Trần Thị B")).toBeInTheDocument()
    expect(screen.getByText("Lê Văn C")).toBeInTheDocument()
  })

  it("shows a dash — not the unknown placeholder — for a valid assignee while options are still loading", () => {
    mockUseEmployeeOptions.mockReturnValue({ options: [], isLoading: true })
    render(<CustomerDetail customer={{ ...customer, salesRepId: "1" }} />)

    expect(screen.queryByText("form.assigneeUnknown")).not.toBeInTheDocument()
    expect(screen.getAllByText("—").length).toBeGreaterThan(0)
  })

  it("shows a placeholder for an assignee id that no longer matches any employee", () => {
    mockUseEmployeeOptions.mockReturnValue({ options: [], isLoading: false })
    render(
      <CustomerDetail customer={{ ...customer, salesRepId: "99", contractManagerId: undefined }} />
    )

    expect(screen.getByText("form.assigneeUnknown")).toBeInTheDocument()
  })

  it("opens the edit form when Edit is clicked and updates in place on success", async () => {
    const user = userEvent.setup()
    mockUpdateCustomer.mockResolvedValue({
      data: { ...customer, company: "New Co" },
      error: null,
    })
    render(<CustomerDetail customer={customer} />)

    await user.click(screen.getByRole("button", { name: "edit" }))
    expect(screen.getByLabelText("form.name")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "form.submit" }))

    expect(mockUpdateCustomer).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ name: customer.name })
    )
    expect(mockToastSuccess).toHaveBeenCalledWith("toast.updateSuccess")
  })

  it("shows a confirm dialog before deleting, then redirects to the list on success", async () => {
    const user = userEvent.setup()
    mockDeleteCustomer.mockResolvedValue({ data: undefined, error: null })
    render(<CustomerDetail customer={customer} />)

    await user.click(screen.getByRole("button", { name: "delete" }))
    const dialog = screen.getByRole("alertdialog")
    expect(mockDeleteCustomer).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole("button", { name: "delete" }))

    expect(mockDeleteCustomer).toHaveBeenCalledWith("1")
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("/customers"))
  })
})
