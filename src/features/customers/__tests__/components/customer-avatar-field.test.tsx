import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

import { CustomerAvatarField } from "../../components/customer-avatar-field"

function makeFile(name: string) {
  return new File(["dummy"], name, { type: "image/png" })
}

describe("CustomerAvatarField", () => {
  it("calls onChange with the picked file's name", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CustomerAvatarField onChange={onChange} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, makeFile("logo.png"))

    expect(onChange).toHaveBeenCalledWith("logo.png")
  })

  it("shows the current-file hint in edit mode when no new file is picked", () => {
    render(<CustomerAvatarField value="old-logo.png" onChange={vi.fn()} />)

    expect(screen.getByText("form.avatarCurrent")).toBeInTheDocument()
  })

  it("removing the picked file calls onChange with undefined", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CustomerAvatarField onChange={onChange} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, makeFile("logo.png"))
    onChange.mockClear()

    await user.click(screen.getByRole("button", { name: "form.avatarRemove" }))

    expect(onChange).toHaveBeenCalledWith(undefined)
  })
})
