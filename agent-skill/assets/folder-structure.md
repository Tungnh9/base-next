# Folder Structure — base-next

Bản đồ toàn bộ cấu trúc thư mục. Load file này khi cần biết đặt file ở đâu.

---

```
base-next/
│
├── proxy.ts                        # Auth guard (thay middleware.ts trong Next.js 16)
│                                   # → Đọc file này trước khi làm bất kỳ thứ gì liên quan auth
│
├── CLAUDE.md                       # Rules cho Claude Code (trỏ sang AGENTS.md)
├── AGENTS.md                       # Next.js 16 breaking changes warning
├── README.md                       # Stack, cấu trúc, conventions đầy đủ
│
├── components.json                 # shadcn/ui config — KHÔNG tự sửa
├── .env.example                    # Template env — được commit
├── .env.local                      # Giá trị thực — KHÔNG commit
│
├── agent-skill/                    # ← Bộ skill này đang ở đây
│   ├── SKILL.md
│   ├── assets/
│   ├── prompts/
│   ├── scripts/
│   ├── references/
│   ├── examples/
│   └── templates/
│
├── messages/                       # i18n translations
│   ├── vi.json                     # Tiếng Việt (locale mặc định)
│   └── en.json                     # Tiếng Anh
│
└── src/
    ├── app/                        # Next.js App Router — CHỈ routing, không logic
    │   ├── layout.tsx              # Root layout
    │   ├── page.tsx                # Redirect / → /vi
    │   ├── error.tsx               # Global error boundary (Client Component)
    │   ├── global-error.tsx        # Lỗi bọc ngoài root layout
    │   ├── not-found.tsx           # Trang 404
    │   ├── loading.tsx             # Loading UI toàn trang
    │   └── [locale]/
    │       ├── layout.tsx          # NextIntlClientProvider
    │       ├── page.tsx            # Trang chủ
    │       ├── (auth)/             # Route group — không cần auth
    │       │   ├── login/page.tsx
    │       │   └── register/page.tsx
    │       └── (protected)/        # Route group — cần auth
    │           ├── layout.tsx      # Server check session
    │           └── dashboard/page.tsx
    │
    ├── features/                   # ← TẤT CẢ business logic ở đây
    │   └── [feature-name]/
    │       ├── types.ts            # TypeScript interfaces
    │       ├── schemas.ts          # Zod validation
    │       ├── api.ts              # Client-side fetch
    │       ├── actions.ts          # Server Actions (mutations)
    │       ├── hooks/              # Custom React hooks
    │       └── components/         # UI components của feature
    │
    ├── components/
    │   └── ui/                     # shadcn/ui components — KHÔNG sửa thủ công
    │                               # Thêm qua: npx shadcn@latest add [name]
    │
    ├── lib/
    │   ├── utils.ts                # cn() utility và helpers dùng chung
    │   ├── api.ts                  # serverApi() và clientApi() helpers
    │   └── auth.ts                 # getSession() và auth utilities
    │
    ├── stores/
    │   ├── index.ts                # Re-export tất cả stores
    │   └── ui-store.ts             # Theme, sidebarOpen (persist)
    │
    ├── hooks/
    │   ├── use-mounted.ts          # Hydration safety hook
    │   └── use-media-query.ts      # Responsive breakpoint hook
    │
    ├── i18n/
    │   ├── config.ts               # Danh sách locales, defaultLocale
    │   ├── routing.ts              # defineRouting() config
    │   └── request.ts              # getRequestConfig() — load messages
    │
    └── types/
        ├── index.ts                # Re-export + Nullable<T>, Optional<T>
        └── api.ts                  # ApiResponse<T>, ApiError, PaginatedResponse<T>
```

---

## Quy tắc đặt file

| Loại file | Đặt ở đâu |
|-----------|-----------|
| Business logic, data fetching | `src/features/[name]/` |
| UI component dùng chung | `src/components/ui/` (shadcn) |
| Custom hook dùng chung | `src/hooks/` |
| Utility function dùng chung | `src/lib/utils.ts` |
| Global state | `src/stores/[name]-store.ts` |
| TypeScript types dùng chung | `src/types/` |
| Route page | `src/app/[locale]/(group)/[name]/page.tsx` |
| i18n string | `messages/vi.json` + `messages/en.json` |

---

## Anti-patterns — Không làm

```
❌ Logic trong page.tsx → Đặt vào src/features/
❌ Fetch data trong Client Component → Dùng Server Component hoặc actions.ts
❌ Sửa file trong src/components/ui/ → Thêm wrapper component riêng
❌ Import relative path dài (../../..) → Dùng @/ alias
❌ Type inline trong component file → Đặt vào features/[name]/types.ts
```