import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

// vi.mock calls are hoisted — run before any import. Without this, the
// form's real useEmployeeOptions() would call the getEmployeeOptions Server
// Action -> cookies(), which throws outside a request context in jsdom.
vi.mock("@/features/employees", () => ({
  useEmployeeOptions: vi.fn(),
}))

import { CustomerForm } from "../../components/customer-form"
import { useEmployeeOptions } from "@/features/employees"
import type { Customer } from "../../types"

const mockUseEmployeeOptions = vi.mocked(useEmployeeOptions)

const employeeOptions = [
  { id: "1", name: "Nguyễn Văn An", department: "sales" as const },
  { id: "2", name: "Trần Thị B", department: "engineering" as const },
]

describe("CustomerForm — discard changes confirmation", () => {
  const onOpenChange = vi.fn()
  const onSubmit = vi.fn().mockResolvedValue(true)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseEmployeeOptions.mockReturnValue({ options: employeeOptions, isLoading: false })
  })

  it("closes immediately when there are no unsaved changes", async () => {
    const user = userEvent.setup()
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "form.cancel" }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("shows a confirm dialog instead of closing when there are unsaved changes", async () => {
    const user = userEvent.setup()
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("form.name"), "Nguyễn Văn A")
    await user.click(screen.getByRole("button", { name: "form.cancel" }))

    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it("confirming discard in the nested dialog actually closes the form", async () => {
    const user = userEvent.setup()
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("form.name"), "Nguyễn Văn A")
    await user.click(screen.getByRole("button", { name: "form.cancel" }))
    await user.click(screen.getByRole("button", { name: "form.discardConfirm" }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("choosing to continue editing keeps the form open and dismisses only the confirm dialog", async () => {
    const user = userEvent.setup()
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("form.name"), "Nguyễn Văn A")
    await user.click(screen.getByRole("button", { name: "form.cancel" }))
    await user.click(screen.getByRole("button", { name: "form.discardCancel" }))

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it("closes immediately on a successful submit even though the form is dirty — no discard dialog", async () => {
    const user = userEvent.setup()
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("form.name"), "Nguyễn Văn A")
    await user.type(screen.getByLabelText("form.email"), "a@example.com")
    await user.type(screen.getByLabelText("form.phone"), "0901234567")
    await user.type(screen.getByLabelText("form.company"), "ABC Corp")
    await user.click(screen.getByRole("button", { name: "form.submit" }))

    expect(onSubmit).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })
})

describe("CustomerForm — mã khách hàng (code)", () => {
  const onOpenChange = vi.fn()
  const onSubmit = vi.fn().mockResolvedValue(true)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseEmployeeOptions.mockReturnValue({ options: employeeOptions, isLoading: false })
  })

  it("is read-only and empty with an auto-generate placeholder in create mode", () => {
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    const codeInput = screen.getByLabelText("form.code") as HTMLInputElement
    expect(codeInput).toHaveAttribute("readonly")
    expect(codeInput.value).toBe("")
  })

  it("shows the real code in edit mode", () => {
    const customer: Customer = {
      id: "1",
      code: "KH00042",
      name: "Nguyễn Văn An",
      email: "an@example.com",
      phone: "0901234567",
      company: "ABC",
      classification: "corporation",
      industry: "finance-banking",
      status: "collaborating",
      createdAt: "2024-01-15T00:00:00.000Z",
    }
    render(
      <CustomerForm open onOpenChange={onOpenChange} customer={customer} onSubmit={onSubmit} />
    )

    expect((screen.getByLabelText("form.code") as HTMLInputElement).value).toBe("KH00042")
  })
})

describe("CustomerForm — NVKD/QLHĐ employee picker", () => {
  const onOpenChange = vi.fn()
  const onSubmit = vi.fn().mockResolvedValue(true)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("disables both assignee Selects while employee options are loading", () => {
    mockUseEmployeeOptions.mockReturnValue({ options: [], isLoading: true })
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    const salesRepTrigger = screen.getByRole("combobox", { name: "form.salesRep" })
    const contractManagerTrigger = screen.getByRole("combobox", { name: "form.contractManager" })

    expect(salesRepTrigger).toBeDisabled()
    expect(contractManagerTrigger).toBeDisabled()
  })

  it("lists the fetched employees once loaded", async () => {
    const user = userEvent.setup()
    mockUseEmployeeOptions.mockReturnValue({ options: employeeOptions, isLoading: false })
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    await user.click(screen.getByRole("combobox", { name: "form.salesRep" }))

    expect(screen.getByRole("option", { name: /Nguyễn Văn An/ })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: /Trần Thị B/ })).toBeInTheDocument()
  })
})

describe("CustomerForm — quốc gia/tỉnh thành cascade", () => {
  const onOpenChange = vi.fn()
  const onSubmit = vi.fn().mockResolvedValue(true)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseEmployeeOptions.mockReturnValue({ options: employeeOptions, isLoading: false })
  })

  it("province Select is enabled by default (country defaults to Vietnam)", () => {
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    expect(screen.getByRole("combobox", { name: "form.province" })).toBeEnabled()
  })

  it("selecting a province then switching country away from Vietnam clears and disables it", async () => {
    const user = userEvent.setup()
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    await user.click(screen.getByRole("combobox", { name: "form.province" }))
    await user.click(screen.getByRole("option", { name: "province.ha-noi" }))
    expect(screen.getByRole("combobox", { name: "form.province" })).toHaveTextContent(
      "province.ha-noi"
    )

    await user.click(screen.getByRole("combobox", { name: "form.country" }))
    await user.click(screen.getByRole("option", { name: "country.japan" }))

    const provinceTrigger = screen.getByRole("combobox", { name: "form.province" })
    expect(provinceTrigger).toBeDisabled()
    expect(provinceTrigger).not.toHaveTextContent("province.ha-noi")

    await user.type(screen.getByLabelText("form.name"), "Nguyễn Văn A")
    await user.type(screen.getByLabelText("form.email"), "a@example.com")
    await user.type(screen.getByLabelText("form.phone"), "0901234567")
    await user.type(screen.getByLabelText("form.company"), "ABC Corp")
    await user.click(screen.getByRole("button", { name: "form.submit" }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ country: "japan", province: undefined })
    )
  })
})
