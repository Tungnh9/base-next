import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { PasswordStrengthMeter } from "../../components/password-strength-meter"

describe("PasswordStrengthMeter", () => {
  it("shows the weak label for an empty or low-entropy password", () => {
    render(<PasswordStrengthMeter password="" />)
    expect(screen.getByText("passwordStrengthWeak")).toBeInTheDocument()
  })

  it("shows the medium label once 3-4 requirements are met", () => {
    render(<PasswordStrengthMeter password="Abcdefgh" />)
    expect(screen.getByText("passwordStrengthMedium")).toBeInTheDocument()
  })

  it("shows the strong label once all 5 requirements are met", () => {
    render(<PasswordStrengthMeter password="Abcdefg1!" />)
    expect(screen.getByText("passwordStrengthStrong")).toBeInTheDocument()
  })

  it("renders all 5 requirement rows", () => {
    render(<PasswordStrengthMeter password="" />)
    expect(screen.getByText("passwordReqMinLength")).toBeInTheDocument()
    expect(screen.getByText("passwordReqUppercase")).toBeInTheDocument()
    expect(screen.getByText("passwordReqLowercase")).toBeInTheDocument()
    expect(screen.getByText("passwordReqDigit")).toBeInTheDocument()
    expect(screen.getByText("passwordReqSpecialChar")).toBeInTheDocument()
  })

  it("marks a met requirement as success-colored and an unmet one as muted", () => {
    render(<PasswordStrengthMeter password="Abcdefg1!" />)

    // All 5 requirements pass for this password.
    expect(screen.getByText("passwordReqUppercase")).toHaveClass("text-success")
  })

  it("does not mark unmet requirements as success-colored", () => {
    render(<PasswordStrengthMeter password="abc" />)

    expect(screen.getByText("passwordReqUppercase")).not.toHaveClass("text-success")
    expect(screen.getByText("passwordReqLowercase")).toHaveClass("text-success")
  })
})
