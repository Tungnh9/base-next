import { test, expect } from "@playwright/test"
import { login, MOCK_NORMAL_EMAIL, MOCK_ADMIN_EMAIL } from "./utils"

test.describe("Route protection", () => {
  test("unauthenticated visit to a protected route redirects to /login with a callbackUrl", async ({
    page,
  }) => {
    await page.goto("/dashboard")

    await expect(page).toHaveURL(/\/login/)
    const url = new URL(page.url())
    expect(url.searchParams.get("callbackUrl")).toBe("/dashboard")
  })

  test("logged-in non-admin visiting /employees (admin-only per src/config/nav.ts) redirects to /not-authorized", async ({
    page,
  }) => {
    await login(page, MOCK_NORMAL_EMAIL)
    await expect(page).toHaveURL(/\/en\/dashboard/)

    await page.goto("/en/employees")

    await expect(page).toHaveURL(/\/en\/not-authorized/)
  })

  test("logged-in admin mock account can reach /employees", async ({ page }) => {
    await login(page, MOCK_ADMIN_EMAIL)
    await expect(page).toHaveURL(/\/en\/dashboard/)

    await page.goto("/en/employees")

    await expect(page).toHaveURL(/\/en\/employees/)
    await expect(page.getByRole("heading", { name: "Employees", level: 1 })).toBeVisible()
  })
})
