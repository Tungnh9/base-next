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

import { CustomerDetail } from "../../components/customer-detail"
import { updateCustomer, deleteCustomer } from "../../actions"
import { toast } from "sonner"
import type { Customer } from "../../types"

const mockUpdateCustomer = vi.mocked(updateCustomer)
const mockDeleteCustomer = vi.mocked(deleteCustomer)
const mockToastSuccess = vi.mocked(toast.success)

const customer: Customer = {
  id: "1",
  name: "Nguyễn Văn An",
  email: "an@example.com",
  phone: "0901234567",
  company: "ABC",
  status: "active",
  createdAt: "2024-01-15T00:00:00.000Z",
}

describe("CustomerDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pushMock.mockClear()
  })

  it("renders the customer's info", () => {
    render(<CustomerDetail customer={customer} />)

    expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument()
    expect(screen.getByText("an@example.com")).toBeInTheDocument()
    expect(screen.getByText("0901234567")).toBeInTheDocument()
    expect(screen.getByText("ABC")).toBeInTheDocument()
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
