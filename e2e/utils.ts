import { type Page } from "@playwright/test"

// Mock test accounts documented in docs/auth.md (NEXT_PUBLIC_USE_MOCK_API=true).
// Do not change these without updating docs/auth.md — the whole E2E suite
// depends on this exact mock behavior.
export const MOCK_PASSWORD = "password123"
export const MOCK_NORMAL_EMAIL = "user@example.com"
export const MOCK_ADMIN_EMAIL = "admin@example.com"
export const MOCK_2FA_EMAIL = "2fa@example.com"
export const MOCK_WRONG_EMAIL = "wrong@example.com"
export const MOCK_2FA_OTP = "230320"

export type E2ELocale = "en" | "vi"

interface LocaleStrings {
  emailLabel: string
  passwordLabel: string
  loginButton: string
  verifyButton: string
}

const STRINGS: Record<E2ELocale, LocaleStrings> = {
  en: {
    emailLabel: "Email or Username",
    passwordLabel: "Password",
    loginButton: "Login",
    verifyButton: "Verify my account",
  },
  vi: {
    emailLabel: "Email hoặc Tên đăng nhập",
    passwordLabel: "Mật khẩu",
    loginButton: "Đăng nhập",
    verifyButton: "Xác minh tài khoản",
  },
}

export function localeStrings(locale: E2ELocale): LocaleStrings {
  return STRINGS[locale]
}

// Fills and submits the login form. Does not assert on the outcome — callers
// decide whether to expect a dashboard redirect, a 2FA redirect, or an
// error toast, since the mock account used determines which happens.
export async function login(page: Page, email: string, locale: E2ELocale = "en") {
  const s = localeStrings(locale)
  await page.goto(`/${locale}/login`)
  await page.getByLabel(s.emailLabel).fill(email)
  await page.getByLabel(s.passwordLabel, { exact: true }).fill(MOCK_PASSWORD)
  await page.getByRole("button", { name: s.loginButton }).click()
}

// Types a 6-digit OTP into the two-step verification page's per-digit
// inputs. The component auto-advances focus to the next box as each digit
// is typed, so typing into the first box (rather than filling each box
// individually) mirrors how a real user enters the code.
export async function fillOtp(page: Page, code: string) {
  const firstDigit = page.locator('input[inputmode="numeric"]').first()
  await firstDigit.click()
  await page.keyboard.type(code)
}
