# base-next

Next.js 16 base template — scalable, production-ready, dùng được cho mọi dự án.

## Stack

|               |                                    |
| ------------- | ---------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack) |
| Language      | TypeScript 5 (strict)              |
| Styling       | Tailwind CSS v4 + shadcn/ui        |
| State         | Zustand                            |
| i18n          | next-intl (vi mặc định, en)        |
| Auth          | JWT via `jose` + cookie httpOnly   |
| Forms         | react-hook-form + Zod              |
| Tables        | TanStack Table v8                  |
| Icons         | lucide-react                       |
| Notifications | Sonner + shadcn Toast (Radix)      |
| Rich Text     | TipTap v3 (ProseMirror)            |

---

## Bắt đầu nhanh

```bash
cp .env.example .env.local   # điền JWT_SECRET và API_BASE_URL
npm install
npm run dev                  # http://localhost:3000 → redirect /vi
npm run test                 # Vitest watch mode
npm run test:run             # Chạy toàn bộ test một lần (CI / pre-commit)
npm run test:coverage        # Test + coverage report
```

---

## Cấu trúc thư mục

```
base-next/
├── components.json               # shadcn/ui config
├── .env.example                  # Template biến môi trường (commit vào git)
├── .env.local                    # Giá trị thực — KHÔNG commit
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
    │   ├── loading.tsx           # Loading UI toàn trang
    │   └── [locale]/             # Dynamic segment — locale trong URL (/vi, /en)
    │       ├── layout.tsx        # Cung cấp NextIntlClientProvider cho toàn app
    │       ├── page.tsx          # Trang chủ
    │       ├── (auth)/           # Route group: trang xác thực (không bảo vệ)
    │       │   ├── layout.tsx            # Lavender background + 4 decorative shapes, card 450px
    │       │   ├── login/page.tsx
    │       │   ├── register/page.tsx
    │       │   ├── forgot-password/page.tsx
    │       │   ├── reset-password/page.tsx    # Reads ?token&email from searchParams
    │       │   ├── verify-email/page.tsx      # Reads ?email, Skip + Resend actions
    │       │   └── two-step-verification/page.tsx  # OTP 6-box, reads ?phone, demo code 230320
    │       ├── (protected)/      # Route group: yêu cầu đăng nhập
    │       │   ├── layout.tsx    # Server check session → redirect /login nếu chưa login
    │       │   └── dashboard/page.tsx
    │       └── ui-test/          # Demo tất cả UI components (không bảo vệ)
    │           ├── layout.tsx    # Sidebar điều hướng giữa các demo
    │           ├── buttons/      # Button, ButtonGroup
    │           ├── form/         # Input, Textarea, Select, Checkbox, Radio, Switch...
    │           ├── feedback/     # Alert, Toast, Sonner, Dialog
    │           ├── navigation/   # Breadcrumb, Pagination, Accordion
    │           ├── overlay/      # Tooltip, Popover, DropdownMenu
    │           ├── display/      # Card, Avatar, Badge, Progress, Carousel, Table...
    │           └── editor/       # RichTextEditor + RichTextViewer demo
    │
    ├── components/
    │   ├── ui/                   # shadcn/ui primitives (xem mục UI Components)
    │   ├── editor/               # WYSIWYG rich text editor (TipTap v3)
    │   │   ├── index.ts          # Barrel exports: RichTextEditor, RichTextViewer
    │   │   ├── extensions.ts     # createExtensions() — cấu hình tất cả TipTap extensions
    │   │   ├── rich-text-editor.tsx   # Main editor component ("use client")
    │   │   ├── rich-text-viewer.tsx   # SSR-safe read-only renderer
    │   │   └── toolbar/          # Toolbar sub-components
    │   ├── layout/               # Layout dùng chung toàn app
    │   │   ├── header.tsx        # Server component: search, locale switcher, notifications, user menu
    │   │   ├── sidebar.tsx       # Client component: collapsible nav, dùng Zustand
    │   │   ├── footer.tsx
    │   │   ├── language-switcher.tsx   # EN/VI switcher
    │   │   ├── sidebar-toggle-button.tsx
    │   │   └── user-menu.tsx     # Radix DropdownMenu với Logout action
    │   └── common/
    │       └── providers.tsx     # NextIntlClientProvider + ThemeProvider + TooltipProvider + Toaster
    │
    ├── features/                 # Feature-sliced: mỗi tính năng là 1 module độc lập
    │   └── auth/                 # Module xác thực
    │       ├── types.ts          # User, Session, LoginCredentials, AuthResponse...
    │       ├── schemas.ts        # Zod schemas + factory fns cho tất cả auth forms
    │       ├── actions.ts        # Server Actions: login, register, forgotPassword, resetPassword,
    │       │                     #   twoStepVerification, resendVerificationEmail, resendTwoStepCode
    │       ├── api.ts            # authApi: tất cả auth endpoints
    │       ├── services.ts       # authService: business logic, sign JWT, set cookie
    │       ├── hooks/
    │       │   └── use-auth.ts   # useLoginAction, useRegisterAction, useForgotPasswordAction...
    │       └── components/
    │           ├── login-form.tsx
    │           ├── register-form.tsx
    │           ├── forgot-password-form.tsx
    │           ├── reset-password-form.tsx
    │           ├── verify-email-resend.tsx   # Client component cho nút Resend
    │           ├── two-step-form.tsx         # OTP form với auto-advance
    │           └── otp-input.tsx             # 6-box OTP input (auto-advance, paste, backspace)
    │
    ├── lib/                      # Tiện ích thuần — không phụ thuộc vào React
    │   ├── env.ts                # Zod validate biến môi trường lúc build
    │   ├── api.ts                # serverApi<T>() + clientApi<T>() — base fetch client
    │   ├── auth.ts               # signToken, verifyToken, getSession (React cache), set/clearSessionCookie
    │   ├── constants.ts          # ROUTES object — tất cả path string đặt ở đây
    │   ├── field-variants.ts     # FIELD_SIZE + FIELD_VALIDATION_CLASSES dùng chung cho Input/Textarea/Select
    │   ├── fonts.ts              # Inter font (next/font/google, Vietnamese subset)
    │   └── utils.ts              # cn() — merge Tailwind class (clsx + tailwind-merge)
    │
    ├── stores/                   # Zustand global stores
    │   ├── index.ts              # Re-export tất cả stores
    │   └── ui-store.ts           # sidebarOpen, sidebarCollapsed, theme — chỉ persist theme
    │
    ├── hooks/                    # Custom React hooks dùng chung
    │   └── use-toast.ts          # useToast() + toast() — hệ thống toast notification
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

## UI Components

Tất cả nằm trong `src/components/ui/`. Demo tại `/[locale]/ui-test/`.

### Form Controls

| Component       | Mô tả                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| `input`         | Sizes sm/default/lg, icons trái/phải, floating label, validation state |
| `textarea`      | Sizes, validation state                                                |
| `select`        | Radix Select, sizes, validation state                                  |
| `checkbox`      | Colors: primary/secondary/success/danger/warning/info/dark             |
| `radio`         | RadioGroup với colors                                                  |
| `switch`        | Toggle với colors                                                      |
| `tag-input`     | Multi-tag input, variant: "select" \| "tag"                            |
| `file-upload`   | Drag & drop, single/multiple, preview                                  |
| `slider`        | Range slider, variants, ticks, labels, vertical orientation            |
| `input-group`   | InputGroup + InputGroupInput + InputAddon + InputGroupButton           |
| `custom-option` | Radio/checkbox option cards (horizontal/vertical/image)                |
| `form`          | Form wrapper (react-hook-form)                                         |
| `label`         | Form label                                                             |

### Buttons

| Component      | Mô tả                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| `button`       | Variants: default/secondary/success/destructive/warning/info/dark/outline/ghost/link; sizes xs/sm/default/lg/icon |
| `button-group` | Grouped buttons, horizontal/vertical                                                                              |

### Display & Layout

| Component    | Mô tả                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------- |
| `card`       | CardHeader, CardTitle, CardDescription, CardContent, CardItem, CardFooter, CardImage      |
| `avatar`     | AvatarImage, AvatarFallback, AvatarGroup; sizes 26–72px; status: online/offline/busy/away |
| `badge`      | Variants; skin: filled/light/dot; sizes sm/md                                             |
| `progress`   | Variants; skin: solid/striped; stacked segments                                           |
| `carousel`   | Variants: slide-only/with-control/with-indicator/with-caption; autoplay                   |
| `separator`  | Divider ngang/dọc                                                                         |
| `skeleton`   | Loading placeholder                                                                       |
| `table`      | HTML table cơ bản                                                                         |
| `list-group` | List group                                                                                |

### Navigation

| Component    | Mô tả                                                  |
| ------------ | ------------------------------------------------------ |
| `breadcrumb` | Separators: chevron/slash/check                        |
| `pagination` | Previous/Next/Links/Ellipsis; sizes sm/default/lg      |
| `tabs`       | Tab navigation                                         |
| `accordion`  | Variants: default/border/advance; single/multiple mode |

### Overlay & Feedback

| Component           | Mô tả                                                     |
| ------------------- | --------------------------------------------------------- |
| `tooltip`           | Placements: top/right/bottom/left                         |
| `popover`           | PopoverTrigger, PopoverContent, PopoverTitle, PopoverBody |
| `dropdown-menu`     | Items, checkbox, radio, submenus, separators, shortcuts   |
| `dialog`            | Modal với DialogHeader/Body/Footer/Close                  |
| `alert`             | Variants; icon; closable                                  |
| `toast` + `toaster` | shadcn Toast (Radix) — dùng với `useToast()`              |
| `sonner`            | Sonner toast library wrapper                              |

### Khác

| Component      | Mô tả                                                                |
| -------------- | -------------------------------------------------------------------- |
| `date-picker`  | Calendar, RangeCalendar, MonthPicker, TimePicker, DatePicker popover |
| `data-table`   | TanStack Table với column sorting, row selection                     |
| `theme-toggle` | Dark/Light/System switcher                                           |

### Rich Text Editor

`src/components/editor/` — dùng TipTap v3 (ProseMirror).

```tsx
import { RichTextEditor, RichTextViewer } from "@/components/editor"
import type { JSONContent } from "@tiptap/react"

// Controlled editor (lưu dạng JSON)
const [content, setContent] = useState<JSONContent>()
<RichTextEditor value={content} onChange={setContent} />

// Read-only viewer (Server Component)
<RichTextViewer content={content} />
```

Toolbar: Undo/Redo · Heading · Bold/Italic/Underline/Strike/Code · Text color · Highlight · Alignment · Lists · Checklist · Link · Image (upload + URL) · Table · HR · Clear format.

Upload ảnh: `POST /api/upload` — validate image/*, max 5MB, lưu vào `public/uploads/`. **Production**: thay bằng S3/R2.

---

## Bảo vệ route

Dự án dùng **2 tầng bảo vệ**:

### Tầng 1 — `proxy.ts` (network-level)

Chạy trước khi bất kỳ component nào render. Verify JWT từ session cookie, redirect trước khi trang được xử lý.

```
src/proxy.ts
├── Bỏ qua: /_next/*, /favicon.ico, file tĩnh
├── PUBLIC_PATHS: /login, /register, /forgot-password, /reset-password,
│               /verify-email, /two-step-verification  ← thêm path public tại đây
├── Unauthenticated → redirect /[locale]/login?callbackUrl=...
└── Dùng jose để verify JWT (không cần DB call)
```

> `PUBLIC_PATHS` dùng path **không có** locale prefix — proxy tự `stripLocale()` trước khi so sánh.

### Tầng 2 — `(protected)/layout.tsx` (server component)

Double-check session trong React render tree. `getSession()` đã được wrap bằng React `cache()` nên chỉ verify JWT **1 lần/render** dù được gọi nhiều nơi.

```ts
// src/app/[locale]/(protected)/layout.tsx
const session = await getSession()
if (!session) redirect(ROUTES.login)
```

**Thêm public path:** chỉnh mảng `PUBLIC_PATHS` trong `src/proxy.ts`.

---

## Quy tắc làm việc

### Thêm tính năng mới

Tạo folder mới trong `src/features/[tên-feature]/` theo cấu trúc:

```
features/
└── product/
    ├── types.ts        # kiểu dữ liệu
    ├── schemas.ts      # Zod schemas
    ├── actions.ts      # Server Actions (mutation)
    ├── api.ts          # REST calls (query)
    ├── hooks/          # client hooks
    └── components/     # UI component của feature này
```

Route page chỉ là shell mỏng, import component từ `features/`:

```tsx
// app/[locale]/(protected)/products/page.tsx
import { ProductList } from "@/features/product/components/product-list"
export default function ProductsPage() {
  return <ProductList />
}
```

### Gọi API

```ts
// Trong Server Action hoặc Route Handler — tự lấy session cookie
const { data, error } = await serverApi<User>("/users/me")

// Trong client component
const { data, error } = await clientApi<Product[]>("/products")
```

`ApiResponse<T>` là discriminated union:

```ts
type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string; status: number } }
```

### Server Actions

```ts
"use server"
export async function myAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = mySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { data, error } = await serverApi<Result>("/endpoint", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  })
  if (error) return { error: error.message }

  redirect(ROUTES.somewhere)
}
```

Dùng hook `useActionState` để kết nối với form (xem `src/features/auth/hooks/use-auth.ts`).

### Toast

```ts
import { toast } from "@/hooks/use-toast"

// Simple toast (tự đóng sau 5 giây)
toast({ title: "Đã lưu" })

// Rich toast (không tự đóng, có icon trạng thái)
toast({
  type: "rich",
  variant: "success", // default | primary | success | danger | warning | info
  title: "Thành công!",
  description: "Dữ liệu đã được cập nhật.",
})

// Toast có action button
toast({
  type: "rich",
  variant: "danger",
  title: "Xóa mục này?",
  action: { label: "Hoàn tác", onClick: () => restore() },
})
```

### Thêm ngôn ngữ

1. Thêm locale vào `src/i18n/config.ts`
2. Tạo file `messages/[locale].json`
3. next-intl tự xử lý phần còn lại

### Thêm string dịch

Mọi string hiển thị phải qua next-intl — **không hardcode**:

```ts
// Server Component
const t = await getTranslations("mySection")
// Client Component
const t = useTranslations("mySection")
```

Thêm key vào `messages/en.json` và `messages/vi.json` trước khi dùng.

---

## Biến môi trường

| Biến                       | Bắt buộc | Mô tả                                          |
| -------------------------- | -------- | ---------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`      | ✓        | URL của app (VD: `http://localhost:3000`)      |
| `JWT_SECRET`               | ✓        | Khóa ký JWT, tối thiểu 32 ký tự                |
| `API_BASE_URL`             | ✓        | URL backend API (server-side)                  |
| `NEXT_PUBLIC_APP_NAME`     |          | Tên app hiển thị                               |
| `SESSION_COOKIE_NAME`      |          | Tên cookie session (mặc định: `session`)       |
| `NEXT_PUBLIC_API_BASE_URL` |          | URL backend API (client-side, nếu khác server) |
| `NODE_ENV`                 |          | `development` \| `production` \| `test`        |

> Tất cả biến được validate lúc build bằng Zod (`src/lib/env.ts`). Build sẽ fail nếu thiếu biến bắt buộc.

Tạo secret: `openssl rand -base64 32`

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
