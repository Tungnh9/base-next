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

// shortName/taxCode/salesRepId/contractManagerId are required fields — any
// test that needs a successful submit has to fill all of them in, not just
// the original 4-field baseline (name/email/phone/company).
async function fillRequiredAssigneeAndTaxFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("form.shortName"), "ABC")
  await user.type(screen.getByLabelText("form.taxCode"), "0123456789")
  await user.click(screen.getByRole("combobox", { name: "form.salesRep" }))
  await user.click(screen.getByRole("option", { name: /Nguyễn Văn An/ }))
  await user.click(screen.getByRole("combobox", { name: "form.contractManager" }))
  await user.click(screen.getByRole("option", { name: /Trần Thị B/ }))
}

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
    await fillRequiredAssigneeAndTaxFields(user)
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
      opportunityCount: 0,
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

  it("does not offer a 'none' option — a real employee must be picked for both assignee fields", async () => {
    const user = userEvent.setup()
    mockUseEmployeeOptions.mockReturnValue({ options: employeeOptions, isLoading: false })
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    await user.click(screen.getByRole("combobox", { name: "form.salesRep" }))

    expect(screen.getAllByRole("option")).toHaveLength(employeeOptions.length)
  })

  it("blocks submit and shows an error when NVKD/QLHĐ are left unselected", async () => {
    const user = userEvent.setup()
    mockUseEmployeeOptions.mockReturnValue({ options: employeeOptions, isLoading: false })
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("form.name"), "Nguyễn Văn A")
    await user.type(screen.getByLabelText("form.email"), "a@example.com")
    await user.type(screen.getByLabelText("form.phone"), "0901234567")
    await user.type(screen.getByLabelText("form.company"), "ABC Corp")
    await user.type(screen.getByLabelText("form.shortName"), "ABC")
    await user.type(screen.getByLabelText("form.taxCode"), "0123456789")
    await user.click(screen.getByRole("button", { name: "form.submit" }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("combobox", { name: "form.salesRep" })).toHaveAttribute(
      "aria-invalid",
      "true"
    )
  })
})

describe("CustomerForm — phone/email/website icons", () => {
  const onOpenChange = vi.fn()
  const onSubmit = vi.fn().mockResolvedValue(true)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseEmployeeOptions.mockReturnValue({ options: employeeOptions, isLoading: false })
  })

  it("renders a matching icon inside the phone, email, and website fields", () => {
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    const phoneWrapper = screen.getByLabelText("form.phone").closest('[data-slot="input-wrapper"]')
    const emailWrapper = screen.getByLabelText("form.email").closest('[data-slot="input-wrapper"]')
    const websiteWrapper = screen
      .getByLabelText("form.website")
      .closest('[data-slot="input-wrapper"]')

    expect(phoneWrapper?.querySelector("svg.lucide-phone")).toBeInTheDocument()
    expect(emailWrapper?.querySelector("svg.lucide-mail")).toBeInTheDocument()
    expect(websiteWrapper?.querySelector("svg.lucide-globe")).toBeInTheDocument()
  })

  it("renders a matching icon inside every mobile/email field in the Người liên hệ section", () => {
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    for (const key of [
      "form.representativeMobile",
      "form.contactMobile",
      "form.mediaContactMobile",
    ]) {
      const wrapper = screen.getByLabelText(key).closest('[data-slot="input-wrapper"]')
      expect(wrapper?.querySelector("svg.lucide-phone")).toBeInTheDocument()
    }

    for (const key of ["form.representativeEmail", "form.contactEmail", "form.mediaContactEmail"]) {
      const wrapper = screen.getByLabelText(key).closest('[data-slot="input-wrapper"]')
      expect(wrapper?.querySelector("svg.lucide-mail")).toBeInTheDocument()
    }
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
    await fillRequiredAssigneeAndTaxFields(user)
    await user.click(screen.getByRole("button", { name: "form.submit" }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ country: "japan", province: undefined })
    )
  })
})

describe("CustomerForm — required-field markers", () => {
  const onOpenChange = vi.fn()
  const onSubmit = vi.fn().mockResolvedValue(true)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseEmployeeOptions.mockReturnValue({ options: employeeOptions, isLoading: false })
  })

  // The "*" is a sibling of <label>, not inside it (see customer-form-field.tsx) —
  // getByLabelText must still resolve on the exact label text for this to hold.
  function asteriskFor(labelKey: string) {
    return screen.getByText(labelKey).parentElement?.querySelector("span.text-destructive")
  }

  it("shows a red asterisk next to every required field's label", () => {
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    for (const key of [
      "form.name",
      "form.shortName",
      "form.company",
      "form.industry",
      "form.classification",
      "form.salesRep",
      "form.contractManager",
      "form.status",
      "form.taxCode",
      "form.phone",
      "form.email",
    ]) {
      expect(asteriskFor(key), `expected an asterisk next to ${key}`).toBeInTheDocument()
    }
  })

  it("does not show an asterisk next to optional fields", () => {
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    for (const key of ["form.website", "form.address", "form.country", "form.province"]) {
      expect(asteriskFor(key), `did not expect an asterisk next to ${key}`).toBeNull()
    }
  })

  it("still resolves form.name via getByLabelText despite the sibling asterisk", () => {
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    expect(screen.getByLabelText("form.name")).toBeInTheDocument()
  })

  it("marks every required Select as aria-required, for assistive tech that can't see the asterisk", () => {
    render(<CustomerForm open onOpenChange={onOpenChange} customer={null} onSubmit={onSubmit} />)

    for (const name of [
      "form.industry",
      "form.classification",
      "form.status",
      "form.salesRep",
      "form.contractManager",
    ]) {
      expect(screen.getByRole("combobox", { name })).toHaveAttribute("aria-required", "true")
    }
  })
})
