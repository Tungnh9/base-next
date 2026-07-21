import { test, expect } from "@playwright/test"
import { login, MOCK_NORMAL_EMAIL } from "./utils"

// The LanguageSwitcher component (src/components/layout/language-switcher.tsx)
// only renders inside the (protected) layout's Header, so these specs log in
// first rather than exercising it from a public page.

test.describe("Locale switching (language-switcher component)", () => {
  test("switches from /en to /vi and translates the sidebar", async ({ page }) => {
    await login(page, MOCK_NORMAL_EMAIL, "en")
    await expect(page).toHaveURL(/\/en\/dashboard/)
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible()

    await page.getByRole("button", { name: "Change language" }).click()
    await page.getByRole("button", { name: "Tiếng Việt" }).click()

    await expect(page).toHaveURL(/\/vi\/dashboard/)
    await expect(page.getByRole("link", { name: "Bảng điều khiển" })).toBeVisible()
    await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toHaveCount(0)
  })

  test("switches from /vi back to /en and translates the sidebar", async ({ page }) => {
    await login(page, MOCK_NORMAL_EMAIL, "vi")
    await expect(page).toHaveURL(/\/vi\/dashboard/)
    await expect(page.getByRole("link", { name: "Bảng điều khiển" })).toBeVisible()

    await page.getByRole("button", { name: "Đổi ngôn ngữ" }).click()
    await page.getByRole("button", { name: "English" }).click()

    await expect(page).toHaveURL(/\/en\/dashboard/)
    await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: "Bảng điều khiển" })).toHaveCount(0)
  })
})
