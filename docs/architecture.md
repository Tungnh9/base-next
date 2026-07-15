# Kiến trúc & Cấu trúc thư mục

## Cấu trúc thư mục

```
base-next/
├── components.json               # shadcn/ui config
├── .env.example                  # Template biến môi trường (commit vào git)
├── .env.local                    # Giá trị thực — KHÔNG commit
├── .npmrc                        # legacy-peer-deps=true (React 19 peer deps)
│
├── messages/                     # Bản dịch i18n
│   ├── vi.json                   # Tiếng Việt (locale mặc định)
│   └── en.json                   # Tiếng Anh
│
└── src/
    ├── proxy.ts                  # Auth guard tầng 1 (Next.js 16 — thay thế middleware.ts)
    ├── app/                      # Next.js App Router — chỉ chứa file routing
    │   ├── layout.tsx            # Root layout: <html lang> tự động theo locale
    │   ├── page.tsx              # Redirect / → /vi
    │   ├── error.tsx             # Global error boundary (client component)
    │   ├── global-error.tsx      # Lỗi bọc ngoài root layout
    │   ├── not-found.tsx         # Trang 404
    │   └── [locale]/             # Dynamic segment — locale trong URL (/vi, /en)
    │       ├── layout.tsx        # Cung cấp NextIntlClientProvider cho toàn app
    │       ├── page.tsx          # Trang chủ
    │       ├── (auth)/           # Route group: trang xác thực (không bảo vệ)
    │       │   ├── layout.tsx            # Lavender background + 4 decorative shapes, card 450px
    │       │   ├── login/page.tsx
    │       │   ├── register/page.tsx
    │       │   ├── forgot-password/page.tsx
    │       │   ├── forgot-password-verify/page.tsx  # OTP 6-box verify, reads ?email
    │       │   ├── reset-password/page.tsx    # Reads ?token&email; guard: no token → redirect forgot-password
    │       │   ├── verify-email/page.tsx      # Reads ?email, Skip + Resend actions
    │       │   └── two-step-verification/page.tsx  # OTP 6-box, reads ?phone, demo code 230320
    │       └── (protected)/      # Route group: yêu cầu đăng nhập
    │           ├── layout.tsx    # Server check session → redirect /login nếu chưa login
    │           └── dashboard/page.tsx
    │
    ├── components/
    │   ├── ui/                   # shadcn/ui primitives
    │   ├── editor/               # WYSIWYG rich text editor (TipTap v3)
    │   │   ├── index.ts          # Barrel exports: RichTextEditor, RichTextViewer
    │   │   ├── extensions.ts     # createExtensions() — cấu hình tất cả TipTap extensions
    │   │   ├── rich-text-editor.tsx   # Main editor component ("use client")
    │   │   ├── rich-text-viewer.tsx   # SSR-safe read-only renderer
    │   │   ├── mention/          # @mention extension + popup list
    │   │   ├── slash/            # /slash command extension + item list
    │   │   ├── video/            # Video embed extension (YouTube, Vimeo, URL)
    │   │   ├── chart/            # ECharts chart node (bar, line, pie)
    │   │   └── toolbar/          # Toolbar sub-components (color, emoji, image, link, table...)
    │   ├── layout/               # Layout dùng chung toàn app
    │   │   ├── header.tsx        # Server component: search, locale switcher, notifications, user menu
    │   │   ├── sidebar.tsx       # Client component: collapsible nav, dùng Zustand
    │   │   ├── footer.tsx
    │   │   ├── language-switcher.tsx   # EN/VI switcher
    │   │   └── user-menu.tsx     # Radix DropdownMenu với Logout action
    │   └── common/
    │       └── providers.tsx     # NextIntlClientProvider + ThemeProvider + TooltipProvider + SonnerToaster
    │
    ├── features/                 # Feature-sliced: mỗi tính năng là 1 module độc lập
    │   ├── auth/                 # Module xác thực
    │       ├── types.ts          # User, Session, AuthResponse, VerifyForgotPasswordCodeResponse
    │       ├── schemas.ts        # Zod schemas (static) + factory fns với i18n messages (client)
    │       ├── actions.ts        # Server Actions: login, register, forgotPassword, verifyForgotPasswordCode,
    │       │                     #   resetPassword, logout, skipVerification, twoStepVerification,
    │       │                     #   resendVerificationEmail, resendTwoStepCode
    │       ├── api.ts            # authApi: switch mock/real qua USE_MOCK_API
    │       ├── mock-data.ts      # authMockApi: fixture data, fixed test cases
    │       ├── services.ts       # authService: business logic, sign JWT, set/clear cookie
    │       ├── hooks/
    │       │   └── use-auth.ts   # useLoginAction, useRegisterAction, useForgotPasswordAction...
    │       └── components/
    │           ├── login-form.tsx
    │           ├── register-form.tsx
    │           ├── forgot-password-form.tsx
    │           ├── forgot-password-verify-form.tsx
    │           ├── reset-password-form.tsx
    │           ├── verify-email-resend.tsx
    │           ├── two-step-form.tsx
    │           └── otp-input.tsx
    │   └── customers/            # Module khách hàng (CRUD mẫu — tham khảo khi làm feature mới)
    │       ├── index.ts          # Barrel exports
    │       ├── types.ts          # Customer, CustomerStatus, CreateCustomerInput, UpdateCustomerInput, CustomerFilters
    │       ├── schemas.ts        # createCustomerSchema, updateCustomerSchema (Zod) + FormValues types
    │       ├── api.ts            # customerApi: switch mock/real qua USE_MOCK_API
    │       ├── actions.ts        # Server Actions: getCustomers, createCustomer, updateCustomer, deleteCustomer
    │       ├── mock-data.ts      # customerMockApi: fixture data
    │       ├── hooks/
    │       │   └── use-customers.ts  # useCustomers() — tick-based refresh pattern
    │       ├── components/
    │       │   ├── customer-list.tsx  # Table với search, skeleton, CRUD actions
    │       │   └── customer-form.tsx  # Dialog form tạo/sửa (RHF + zodResolver)
    │       └── __tests__/
    │           └── schemas.test.ts    # 8 test cases cho Zod schemas
    │
    ├── lib/                      # Tiện ích thuần — không phụ thuộc vào React
    │   ├── env.ts                # Zod validate biến môi trường lúc build
    │   ├── api-client.ts         # ApiClient class (axios facade) + ApiClientError
    │   ├── base-api.service.ts   # BaseApiService abstract class — extend cho feature services
    │   ├── api.ts                # serverApi<T>() + clientApi<T>() + serverHttpClient/browserHttpClient
    │   ├── auth.ts               # signToken, verifyToken, getSession (React cache), set/clearSessionCookie
    │   ├── mock.ts               # mockApi(), mockApiError(), USE_MOCK_API flag
    │   ├── constants.ts          # ROUTES object — tất cả path string đặt ở đây
    │   ├── field-variants.ts     # FIELD_SIZE + FIELD_VALIDATION_CLASSES dùng chung cho Input/Textarea/Select
    │   ├── fonts.ts              # Inter font (next/font/google, Vietnamese subset)
    │   └── utils.ts              # cn() — merge Tailwind class (clsx + tailwind-merge)
    │
    ├── stores/                   # Zustand global stores
    │   ├── index.ts              # Re-export tất cả stores
    │   ├── ui-store.ts           # sidebarCollapsed (persist) + sidebarOpen (không persist)
    │   └── user-store.ts         # user hiện tại — display cache, KHÔNG phải source of truth cho auth
    │
    ├── config/
    │   └── nav.ts                # createNavConfig() → NAV sections + NAV_ITEMS flat list
    │
    ├── i18n/                     # Cấu hình next-intl
    │   ├── config.ts             # locales: ["en", "vi"], defaultLocale: "vi"
    │   ├── routing.ts            # defineRouting() — localePrefix: "always"
    │   └── request.ts            # getRequestConfig() — load messages theo locale
    │
    └── types/                    # TypeScript type dùng chung toàn app
        ├── index.ts              # Re-export + utility types (Nullable, Optional, AsyncFn...)
        └── api.ts                # ApiResponse<T>, ApiError, PaginatedResponse<T>, PaginationParams
```

---

## Path aliases

| Alias            | Trỏ đến            |
| ---------------- | ------------------ |
| `@/*`            | `src/*`            |
| `@/components/*` | `src/components/*` |
| `@/features/*`   | `src/features/*`   |
| `@/lib/*`        | `src/lib/*`        |
| `@/stores/*`     | `src/stores/*`     |
| `@/hooks/*`      | `src/hooks/*`      |
| `@/i18n/*`       | `src/i18n/*`       |
| `@/types/*`      | `src/types/*`      |
| `@/messages/*`   | `messages/*`       |

> **Lưu ý:** Không dùng path alias `@/` trong `src/proxy.ts` — dùng relative import hoặc inline value thay thế (Turbopack biên dịch proxy trong isolated context).
