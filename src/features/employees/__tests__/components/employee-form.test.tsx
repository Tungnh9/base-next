import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { EmployeeForm } from "../../components/employee-form"

describe("EmployeeForm — discard changes confirmation", () => {
  const onOpenChange = vi.fn()
  const onSubmit = vi.fn().mockResolvedValue(true)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("closes immediately when there are no unsaved changes", async () => {
    const user = userEvent.setup()
    render(<EmployeeForm open onOpenChange={onOpenChange} employee={null} onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "form.cancel" }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("shows a confirm dialog instead of closing when there are unsaved changes", async () => {
    const user = userEvent.setup()
    render(<EmployeeForm open onOpenChange={onOpenChange} employee={null} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("form.name"), "Nguyễn Văn A")
    await user.click(screen.getByRole("button", { name: "form.cancel" }))

    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it("confirming discard in the nested dialog actually closes the form", async () => {
    const user = userEvent.setup()
    render(<EmployeeForm open onOpenChange={onOpenChange} employee={null} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("form.name"), "Nguyễn Văn A")
    await user.click(screen.getByRole("button", { name: "form.cancel" }))
    await user.click(screen.getByRole("button", { name: "form.discardConfirm" }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("choosing to continue editing keeps the form open and dismisses only the confirm dialog", async () => {
    const user = userEvent.setup()
    render(<EmployeeForm open onOpenChange={onOpenChange} employee={null} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("form.name"), "Nguyễn Văn A")
    await user.click(screen.getByRole("button", { name: "form.cancel" }))
    await user.click(screen.getByRole("button", { name: "form.discardCancel" }))

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it("closes immediately on a successful submit even though the form is dirty — no discard dialog", async () => {
    const user = userEvent.setup()
    render(<EmployeeForm open onOpenChange={onOpenChange} employee={null} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText("form.name"), "Nguyễn Văn A")
    await user.type(screen.getByLabelText("form.email"), "a@example.com")
    await user.type(screen.getByLabelText("form.phone"), "0901234567")
    await user.type(screen.getByLabelText("form.position"), "Frontend Engineer")
    await user.click(screen.getByRole("button", { name: "form.submit" }))

    expect(onSubmit).toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("prefills fields from the employee prop when editing", () => {
    const employee = {
      id: "1",
      name: "Nguyễn Văn An",
      email: "an@example.com",
      phone: "0901234567",
      department: "engineering" as const,
      position: "Frontend Engineer",
      status: "active" as const,
      joinedAt: "2024-01-01T00:00:00.000Z",
    }
    render(
      <EmployeeForm open onOpenChange={onOpenChange} employee={employee} onSubmit={onSubmit} />
    )

    expect(screen.getByLabelText("form.name")).toHaveValue(employee.name)
    expect(screen.getByLabelText("form.email")).toHaveValue(employee.email)
    expect(screen.getByRole("dialog", { name: "form.titleEdit" })).toBeInTheDocument()
  })
})
