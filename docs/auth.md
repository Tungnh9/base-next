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

| Email / Code        | Kết quả                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Bất kỳ email        | Login thành công, role `user`                                                                  |
| `admin@example.com` | Login thành công, role `admin` — cách duy nhất để vào route admin-only (`/employees`) khi mock |
| `2fa@example.com`   | Trigger 2FA flow, phone `+84900000000`                                                         |
| `wrong@example.com` | Login thất bại (401)                                                                           |
| OTP `230320`        | 2FA verify thành công                                                                          |
| OTP `120820`        | Forgot password code thành công                                                                |

---

## Bảo vệ route

Dự án dùng **2 tầng bảo vệ**:

### Tầng 1 — `proxy.ts` (network-level)

Chạy trước khi bất kỳ component nào render. Verify JWT từ session cookie, redirect trước khi trang được xử lý.

```
src/proxy.ts
├── Bỏ qua: /_next/*, file tĩnh có extension (.svg, .png, ...)
├── PUBLIC_PATHS (không có locale prefix — proxy tự stripLocale()):
│     /login, /register, /forgot-password, /forgot-password-verify,
│     /reset-password, /verify-email, /two-step-verification,
│     /maintenance, /coming-soon, /not-authorized, /api/health
├── MAINTENANCE_MODE=true → redirect mọi path (trừ /maintenance) sang /[locale]/maintenance
├── Unauthenticated → redirect /[locale]/login?callbackUrl=...
└─ Dùng jose để verify JWT (không cần DB call)
```

> Để thêm public path: thêm vào mảng `PUBLIC_PATHS` trong `src/proxy.ts` — không cần locale prefix.

> **Lưu ý:** i18n constants trong proxy.ts được inline trực tiếp (không import `@/i18n/config`) vì Turbopack biên dịch proxy trong isolated context, không resolve tsconfig path alias ổn định. Vì lý do tương tự, `MAINTENANCE_MODE` được đọc trực tiếp từ `process.env` thay vì qua `@/lib/env`.

### Tầng 2 — `(protected)/layout.tsx` (server component)

Double-check session trong React render tree.

```ts
// src/app/[locale]/(protected)/layout.tsx
const session = await getSession()
if (!session) redirect(`/${locale}${ROUTES.login}`)
```

### Tầng 3 — `requireRole()` (authorization, theo route)

`proxy.ts` và tầng 2 chỉ xác thực (đã đăng nhập hay chưa) — không kiểm tra quyền. Route cần giới hạn theo `role` gọi thêm `requireRole()` (`src/lib/auth.ts`) ngay trong page:

```ts
// src/app/[locale]/(protected)/employees/page.tsx
const { locale } = await params
await requireRole(locale, ["admin"]) // không đủ quyền → redirect /[locale]/not-authorized
```

Nav item tương ứng trong `src/config/nav.ts` khai báo `requiredRole: "admin"` để `Sidebar` tự ẩn mục đó với user không đủ quyền (tránh hiển thị link luôn dẫn tới trang không có quyền).

## Session cookie & access token

Session identity (`userId`/`email`/`role`) và backend access token nằm ở **2 cookie riêng** (`src/lib/auth.ts`):

- `session` — JWT ký bằng `JWT_SECRET` (`jose`), chỉ chứa thông tin định danh, dùng cho `getSession()`/`requireRole()`/`requireSession()`.
- `access_token` — token thật của backend, lưu riêng (httpOnly, không nằm trong JWT). JWT chỉ ký chứ không mã hoá nên không được nhét secret thật vào payload; `serverApi()` (`src/lib/api.ts`) đọc token này qua `getAccessToken()` để gắn `Authorization: Bearer` khi gọi backend thật.

`setSession(payload, accessToken)`/`clearSession()` luôn set/xoá cả 2 cookie cùng lúc.

## CSRF stance

Mitigation hiện tại: `sameSite: "lax"` trên **cả 2** cookie (`session` và `access_token`, xem `cookieOptions()` trong `src/lib/auth.ts`). Với `SameSite=Lax`, trình duyệt không đính kèm cookie khi một site khác gửi cross-site POST/PUT/DELETE (form submit, fetch, v.v.) — chỉ navigation GET cấp cao nhất mới mang cookie đi. Vì mọi state-changing action trong app này đều là POST/PUT/DELETE (Server Actions/route handlers), không có state-changing GET endpoint nào, `sameSite: "lax"` là đủ để chặn CSRF cổ điển mà không cần thêm CSRF token riêng.

**Giới hạn đã biết:** `sameSite: "lax"` không bảo vệ được trước CSRF-qua-XSS — nếu attacker chèn được script chạy trên chính origin của app (XSS), script đó chạy same-site nên cookie vẫn được gửi kèm bình thường, `sameSite` không giúp gì ở đây. Đây chính là lý do CSP nonce-based (xem `src/proxy.ts`) vẫn quan trọng: nó là lớp phòng thủ chặn inline script không có nonce hợp lệ chạy được ngay từ đầu, thu hẹp bề mặt tấn công XSS mà CSRF-qua-XSS phụ thuộc vào.

Liên quan (không phải CSRF, nhưng đáng theo dõi trong cùng khu vực rủi ro XSS): `src/components/editor/rich-text-viewer.tsx` dùng `dangerouslySetInnerHTML` để render HTML do TipTap sinh ra — an toàn hay không phụ thuộc vào việc TipTap tự sanitize output của nó, đây là sink đáng để mắt tới nếu sau này nhận HTML từ nguồn không tin cậy hơn.

## Rate limiting

`src/lib/rate-limit.ts` — in-memory, theo cửa sổ cố định (không dùng được khi deploy nhiều instance/serverless, xem comment trong file). Mỗi action tự chọn key có prefix riêng (`login:`, `register:`, `forgot-password:`, `verify-code:`, `resend-verify:`, `2fa:`, `2fa-resend:`) để tránh 2 action khác nhau dùng chung 1 bucket rate-limit của cùng 1 email/IP.
