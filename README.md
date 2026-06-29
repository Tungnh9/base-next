# base-next

Next.js 16 base template — scalable, production-ready, dùng được cho mọi dự án.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand |
| i18n | next-intl (vi mặc định, en) |
| Auth | JWT via `jose` + cookie httpOnly |
| Forms | react-hook-form + Zod |
| Icons | lucide-react |

---

## Bắt đầu nhanh

```bash
cp .env.example .env.local   # điền JWT_SECRET và API_BASE_URL
npm install
npm run dev                  # http://localhost:3000 → redirect /vi
```

---

## Cấu trúc thư mục

```
base-next/
├── proxy.ts                      # Auth guard (Next.js 16 — thay thế middleware.ts)
├── components.json               # shadcn/ui config
├── .env.example                  # Template biến môi trường (commit vào git)
├── .env.local                    # Giá trị thực — KHÔNG commit
│
├── messages/                     # Bản dịch i18n
│   ├── vi.json                   # Tiếng Việt (locale mặc định)
│   └── en.json                   # Tiếng Anh
│
└── src/
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
    │       │   ├── login/page.tsx
    │       │   └── register/page.tsx
    │       └── (protected)/      # Route group: yêu cầu đăng nhập
    │           ├── layout.tsx    # Server check session → redirect /login nếu chưa login
    │           └── dashboard/page.tsx
    │
    ├── components/
    │   ├── ui/                   # shadcn/ui primitives — KHÔNG sửa tay
    │   │   └── button, input, form, dialog, select, card, badge, avatar...
    │   ├── layout/               # Layout dùng chung toàn app
    │   │   ├── header.tsx        # Thanh điều hướng trên cùng
    │   │   ├── sidebar.tsx       # Sidebar (client, dùng Zustand)
    │   │   └── footer.tsx
    │   └── common/
    │       └── providers.tsx     # Compose tất cả Context providers — thêm provider mới ở đây
    │
    ├── features/                 # Feature-sliced: mỗi tính năng là 1 module độc lập
    │   └── auth/                 # Ví dụ: module xác thực
    │       ├── types.ts          # Kiểu TypeScript (User, Session, AuthResponse...)
    │       ├── schemas.ts        # Zod schemas cho form validation
    │       ├── actions.ts        # Server Actions (loginAction, logoutAction)
    │       ├── api.ts            # REST calls đến backend (authApi.login, authApi.me)
    │       ├── hooks/
    │       │   └── use-auth.ts   # Client hook bọc useActionState
    │       └── components/
    │           └── login-form.tsx
    │
    ├── lib/                      # Tiện ích thuần — không phụ thuộc vào React
    │   ├── env.ts                # Zod validate biến môi trường lúc build — import đầu tiên
    │   ├── api.ts                # serverApi() + clientApi() — base fetch client
    │   ├── auth.ts               # signToken, verifyToken, getSession, set/clearSessionCookie
    │   ├── utils.ts              # cn() — merge Tailwind class
    │   └── constants.ts          # ROUTES object — tất cả path string đặt ở đây
    │
    ├── stores/                   # Zustand global stores
    │   ├── index.ts              # Re-export tất cả stores
    │   └── ui-store.ts           # Theme, sidebarOpen — persist theme vào localStorage
    │
    ├── hooks/                    # Custom React hooks dùng chung
    │   ├── use-mounted.ts
    │   └── use-media-query.ts
    │
    ├── i18n/                     # Cấu hình next-intl
    │   ├── config.ts             # Danh sách locale, defaultLocale
    │   ├── routing.ts            # defineRouting() — localePrefix config
    │   └── request.ts            # getRequestConfig() — load messages theo locale
    │
    └── types/                    # TypeScript type dùng chung toàn app
        ├── index.ts              # Re-export + utility types (Nullable, Optional...)
        └── api.ts                # ApiResponse<T>, ApiError, PaginatedResponse<T>
```

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
import { ProductList } from "@/features/product/components/product-list";
export default function ProductsPage() {
  return <ProductList />;
}
```

### Gọi API

```ts
// Trong Server Action hoặc Route Handler — tự lấy session cookie
const { data, error } = await serverApi<User>("/users/me");

// Trong client component — truyền token tường minh
const { data, error } = await clientApi<Product[]>("/products");
```

### Thêm ngôn ngữ

1. Thêm locale vào `src/i18n/config.ts`
2. Tạo file `messages/[locale].json`
3. next-intl tự xử lý phần còn lại

### Bảo vệ route

- **proxy.ts** — chặn ở tầng network (redirect trước khi render)
- **`(protected)/layout.tsx`** — chặn ở tầng server component (double-check session)

Thêm path public (không cần auth) vào `PUBLIC_PATHS` trong `proxy.ts`.

---

## Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ✓ | URL của app (VD: `http://localhost:3000`) |
| `JWT_SECRET` | ✓ | Khóa ký JWT, tối thiểu 32 ký tự |
| `API_BASE_URL` | ✓ | URL backend API (server-side) |
| `NEXT_PUBLIC_APP_NAME` | | Tên app hiển thị |
| `SESSION_COOKIE_NAME` | | Tên cookie session (mặc định: `session`) |
| `NEXT_PUBLIC_API_BASE_URL` | | URL backend API (client-side, nếu khác server) |

> Xem `.env.example` để biết cách đặt giá trị.

---

## Path aliases

| Alias | Trỏ đến |
|---|---|
| `@/*` | `src/*` |
| `@/components/*` | `src/components/*` |
| `@/features/*` | `src/features/*` |
| `@/lib/*` | `src/lib/*` |
| `@/stores/*` | `src/stores/*` |
| `@/hooks/*` | `src/hooks/*` |
| `@/i18n/*` | `src/i18n/*` |
| `@/types/*` | `src/types/*` |
| `@/messages/*` | `messages/*` |
