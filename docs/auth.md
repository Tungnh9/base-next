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

## Rate limiting

`src/lib/rate-limit.ts` — theo cửa sổ cố định (fixed window), API (`checkRateLimit`/`recordFailedAttempt`/`resetRateLimit`) là async và delegate toàn bộ việc lưu trữ cho `src/lib/rate-limit-store.ts`. Mỗi action tự chọn key có prefix riêng (`login:`, `register:`, `forgot-password:`, `verify-code:`, `resend-verify:`, `2fa:`, `2fa-resend:`) để tránh 2 action khác nhau dùng chung 1 bucket rate-limit của cùng 1 email/IP.

### Pluggable store (`src/lib/rate-limit-store.ts`)

`getRateLimitStore()` chọn implementation dựa trên env, memoized singleton:

- Không set `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` → `InMemoryRateLimitStore` (Map trong bộ nhớ tiến trình — không đồng bộ giữa nhiều instance/serverless, reset khi restart). Fallback này log cảnh báo (console warning) **một lần duy nhất** nếu `NODE_ENV=production`, để không spam log nhưng vẫn cảnh báo rõ khi triển khai production thiếu store dùng chung.
- Set cả 2 biến trên → `UpstashRestRateLimitStore`, gọi thẳng Upstash Redis REST API bằng `fetch()` (không phụ thuộc SDK). TTL của key do Redis quản lý (PEXPIRE/PTTL) thay vì tự sweep — phù hợp triển khai nhiều instance/serverless vì state được chia sẻ qua Redis.

Cả hai implement chung interface `RateLimitStore` (`get`/`increment`/`delete`), nên thêm store khác (ví dụ một Redis client khác, DynamoDB, v.v.) chỉ cần viết thêm 1 class và cập nhật `getRateLimitStore()`.

## Session expiry — không có refresh token

Backend hiện **không có** endpoint/field refresh-token nào (đã kiểm tra toàn bộ repo, kể cả mock). Vì vậy:

- Session là một JWT phẳng, hết hạn sau 7 ngày (`signToken()` dùng `setExpirationTime("7d")`, `src/lib/auth.ts`), ký bằng `JWT_SECRET`. Claim chuẩn `exp` (unix seconds, từ thư viện `jose`) có sẵn trên object `session` trả về bởi `getSession()` — không cần thay đổi gì ở backend để đọc được thời điểm hết hạn.
- Khi JWT hết hạn, `verifyToken()`/`getSession()` đơn giản trả về `null` — không throw, không refresh. Lần điều hướng tiếp theo, `proxy.ts` (tầng 1) hoặc `(protected)/layout.tsx` (tầng 2) sẽ redirect về `/login` như một request chưa đăng nhập bình thường. Đây là "silent logout" — không có cơ chế nào tự động gia hạn phiên.
- `SessionExpiryToast` (`src/features/auth/components/session-expiry-toast.tsx`, render trong `(protected)/layout.tsx` cạnh `<Header />`) là **UX mitigation phía client, KHÔNG PHẢI cơ chế refresh token**. Nó dùng hook `useSessionExpiryWarning` (`src/features/auth/hooks/use-session-expiry.ts`) để lên lịch một `setTimeout` duy nhất, bắn cảnh báo trước khi `exp` tới hạn (mặc định 5 phút), hiển thị toast (`sonner`) với action "Đăng xuất ngay" — bấm vào thì `clearUser()` + `logoutAction()` giống hệt logic logout trong `UserMenu`. Người dùng vẫn phải đăng nhập lại sau khi phiên hết hạn thật sự; toast chỉ giúp họ chủ động lưu công việc/đăng xuất sạch sẽ thay vì bị văng đột ngột.
