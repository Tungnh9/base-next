# Authentication

## Auth Flow

### Login

```
LoginForm → loginAction → authService.login()
  ├─ [Normal] signToken + setSessionCookie → { success, user }
  │    └─ Client: setUser(Zustand) → router.push(/dashboard)
  └─ [2FA] returns { requiresTwoFactor, twoFactorPhone }
       └─ Client: router.push(/two-step-verification?phone=...)
            └─ TwoStepForm → twoStepVerificationAction
                 └─ signToken + setSessionCookie → setUser → /dashboard
```

### Register

```
RegisterForm → registerAction → authService.register()
  └─ signToken + setSessionCookie (đã logged in)
       └─ Server redirect: /verify-email?email=...
            ├─ "Skip for now" → skipVerificationAction → /dashboard
            └─ "Resend" → resendVerificationEmailAction
```

### Forgot Password

```
ForgotPasswordForm → forgotPasswordAction
  └─ { requiresEmailVerification: true }
       └─ Client: router.push(/forgot-password-verify?email=...)
            └─ ForgotPasswordVerifyForm (OTP 6 digits)
                 └─ verifyForgotPasswordCodeAction → { resetToken }
                      └─ Client: router.push(/reset-password?token=TOKEN&email=EMAIL)
                           └─ ResetPasswordForm → resetPasswordAction
                                └─ Server redirect: /login
```

> Page `/reset-password` guard: nếu không có `?token` trong URL → redirect về `/forgot-password`.

### Logout

```
UserMenu → clearUser() (Zustand) + logoutAction
  └─ clearSessionCookie() → Server redirect: /login
```

### Mock test cases (NEXT_PUBLIC_USE_MOCK_API=true)

| Email / Code        | Kết quả                                |
| ------------------- | -------------------------------------- |
| Bất kỳ email        | Login thành công                       |
| `2fa@example.com`   | Trigger 2FA flow, phone `+84900000000` |
| `wrong@example.com` | Login thất bại (401)                   |
| OTP `230320`        | 2FA verify thành công                  |
| OTP `120820`        | Forgot password code thành công        |

---

## Bảo vệ route

Dự án dùng **2 tầng bảo vệ**:

### Tầng 1 — `proxy.ts` (network-level)

Chạy trước khi bất kỳ component nào render. Verify JWT từ session cookie, redirect trước khi trang được xử lý.

```
src/proxy.ts
├── Bỏ qua: /_next/*, file tĩnh có extension (.svg, .png, ...)
├── PUBLIC_PATHS (không có locale prefix — proxy tự stripLocale()):
│     /login, /register, /forgot-password, /reset-password,
│     /verify-email, /two-step-verification, /api/health
├── Unauthenticated → redirect /[locale]/login?callbackUrl=...
└─ Dùng jose để verify JWT (không cần DB call)
```

> Để thêm public path: thêm vào mảng `PUBLIC_PATHS` trong `src/proxy.ts` — không cần locale prefix.

> **Lưu ý:** i18n constants trong proxy.ts được inline trực tiếp (không import `@/i18n/config`) vì Turbopack biên dịch proxy trong isolated context, không resolve tsconfig path alias ổn định.

### Tầng 2 — `(protected)/layout.tsx` (server component)

Double-check session trong React render tree. `getSession()` đã được wrap bằng React `cache()` nên chỉ verify JWT **1 lần/render** dù được gọi nhiều nơi.

```ts
// src/app/[locale]/(protected)/layout.tsx
const session = await getSession()
if (!session) redirect(`/${locale}${ROUTES.login}`)
```
