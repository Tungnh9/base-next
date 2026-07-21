import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/vi/employees/1",
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

vi.mock("../../actions", () => ({
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}))

import { EmployeeDetail } from "../../components/employee-detail"
import { updateEmployee, deleteEmployee } from "../../actions"
import { toast } from "sonner"
import type { Employee } from "../../types"

const mockUpdateEmployee = vi.mocked(updateEmployee)
const mockDeleteEmployee = vi.mocked(deleteEmployee)
const mockToastSuccess = vi.mocked(toast.success)

const employee: Employee = {
  id: "1",
  name: "Nguyễn Văn An",
  email: "an@example.com",
  phone: "0901234567",
  department: "engineering",
  position: "Frontend Engineer",
  status: "active",
  joinedAt: "2024-01-15T00:00:00.000Z",
}

describe("EmployeeDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pushMock.mockClear()
  })

  it("renders the employee's info", () => {
    render(<EmployeeDetail employee={employee} />)

    expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument()
    expect(screen.getByText("an@example.com")).toBeInTheDocument()
    expect(screen.getByText("0901234567")).toBeInTheDocument()
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument()
  })

  it("opens the edit form when Edit is clicked and updates in place on success", async () => {
    const user = userEvent.setup()
    mockUpdateEmployee.mockResolvedValue({
      data: { ...employee, position: "Backend Engineer" },
      error: null,
    })
    render(<EmployeeDetail employee={employee} />)

    await user.click(screen.getByRole("button", { name: "edit" }))
    expect(screen.getByLabelText("form.name")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "form.submit" }))

    expect(mockUpdateEmployee).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ name: employee.name })
    )
    expect(mockToastSuccess).toHaveBeenCalledWith("toast.updateSuccess")
  })

  it("shows a confirm dialog before deleting, then redirects to the list on success", async () => {
    const user = userEvent.setup()
    mockDeleteEmployee.mockResolvedValue({ data: undefined, error: null })
    render(<EmployeeDetail employee={employee} />)

    await user.click(screen.getByRole("button", { name: "delete" }))
    const dialog = screen.getByRole("alertdialog")
    expect(mockDeleteEmployee).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole("button", { name: "delete" }))

    expect(mockDeleteEmployee).toHaveBeenCalledWith("1")
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("/employees"))
  })
})
