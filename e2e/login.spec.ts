import { test, expect } from "@playwright/test"
import {
  login,
  fillOtp,
  MOCK_NORMAL_EMAIL,
  MOCK_ADMIN_EMAIL,
  MOCK_2FA_EMAIL,
  MOCK_WRONG_EMAIL,
  MOCK_2FA_OTP,
} from "./utils"

test.describe("Login (mock API)", () => {
  test("logs in with a normal mock account and reaches the dashboard", async ({ page }) => {
    await login(page, MOCK_NORMAL_EMAIL)

    await expect(page).toHaveURL(/\/en\/dashboard/)
  })

  test("admin mock account reaches an admin-only area", async ({ page }) => {
    await login(page, MOCK_ADMIN_EMAIL)
    await expect(page).toHaveURL(/\/en\/dashboard/)

    await page.goto("/en/employees")

    await expect(page).toHaveURL(/\/en\/employees/)
    await expect(page.getByRole("heading", { name: "Employees", level: 1 })).toBeVisible()
  })

  test("2FA mock account is redirected to two-step verification and completes with the documented OTP", async ({
    page,
  }) => {
    await login(page, MOCK_2FA_EMAIL)

    // authMockApi returns requiresTwoFactor for this account — no session
    // cookie yet, so the dashboard remains unreachable until OTP is verified.
    await expect(page).toHaveURL(/\/en\/two-step-verification/)

    await fillOtp(page, MOCK_2FA_OTP)
    await page.getByRole("button", { name: "Verify my account" }).click()

    await expect(page).toHaveURL(/\/en\/dashboard/)
  })

  test("wrong-password mock account shows a login error", async ({ page }) => {
    await login(page, MOCK_WRONG_EMAIL)

    // authMockApi rejects this account with 401 -> loginAction maps the
    // thrown AuthError to the generic "loginFailed" error code (see
    // src/features/auth/actions.ts), surfaced here as a sonner toast.
    await expect(page.getByText("Login failed, please try again")).toBeVisible()
    await expect(page).toHaveURL(/\/en\/login/)
  })
})
