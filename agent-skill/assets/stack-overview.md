# Stack Overview — base-next

Tài liệu tham chiếu nhanh về toàn bộ tech stack.
Dùng khi cần biết package nào làm gì, version nào đang dùng.

---

## Dependency Map

```
base-next
│
├── FRAMEWORK
│   ├── next@16.2.9            → App Router, Turbopack, Server Components
│   ├── react@19.2.4           → UI library
│   └── react-dom@19.2.4       → DOM rendering
│
├── LANGUAGE & TYPES
│   ├── typescript@^5          → Strict mode bắt buộc
│   ├── @types/node@^20
│   ├── @types/react@^19
│   └── @types/react-dom@^19
│
├── STYLING
│   ├── tailwindcss@^4         → Utility-first CSS
│   ├── @tailwindcss/postcss@^4
│   ├── tailwind-merge@^3.6.0  → Merge class có điều kiện (cn())
│   ├── class-variance-authority@^0.7.1 → Component variants
│   └── radix-ui@^1.6.0        → shadcn/ui primitives
│
├── RADIX UI COMPONENTS (qua shadcn/ui)
│   ├── @radix-ui/react-dialog@^1.1.17
│   ├── @radix-ui/react-dropdown-menu@^2.1.18
│   ├── @radix-ui/react-label@^2.1.10
│   ├── @radix-ui/react-select@^2.3.1
│   ├── @radix-ui/react-slot@^1.3.0
│   ├── @radix-ui/react-toast@^1.2.17
│   └── @radix-ui/react-tooltip@^1.2.10
│
├── STATE MANAGEMENT
│   └── zustand@^5.0.14        → Global state, persist middleware
│
├── FORMS & VALIDATION
│   ├── react-hook-form@^7.80.0 → Form state management
│   ├── @hookform/resolvers@^5.4.0 → Kết nối với Zod
│   └── zod@^4.4.3             → Schema validation
│
├── AUTH
│   └── jose@^6.2.3            → JWT sign/verify (httpOnly cookie)
│
├── i18n
│   ├── next-intl@^4.13.0      → Internationalization
│   └── next-themes@^0.4.6     → Dark/light theme
│
├── UI UTILITIES
│   ├── lucide-react@^1.21.0   → Icons (tree-shakeable)
│   └── sonner@^2.0.7          → Toast notifications
│
└── TOOLING
    ├── eslint@^9
    └── eslint-config-next@16.2.9
```

---

## Quyết định kiến trúc quan trọng

| Quyết định | Lý do |
|-----------|-------|
| App Router (không Pages Router) | Server Components, streaming, layouts lồng nhau |
| `proxy.ts` thay `middleware.ts` | Next.js 16 breaking change — middleware API thay đổi |
| Jose thay NextAuth | Lightweight, không phụ thuộc external provider, kiểm soát hoàn toàn |
| Zustand thay Redux/Context | Boilerplate ít, TypeScript tốt, persist đơn giản |
| Sonner thay react-hot-toast | Đã bundled với shadcn/ui, design đẹp hơn |
| next-intl với prefix URL | `/vi/...`, `/en/...` — SEO friendly, clear locale signal |
| Zod v4 | Breaking changes so với v3 — kiểm tra docs trước khi dùng |

---

## Path Aliases

```ts
// tsconfig.json paths — dùng thay vì relative import
@/*              → src/*
@/components/*   → src/components/*
@/features/*     → src/features/*
@/lib/*          → src/lib/*
@/stores/*       → src/stores/*
@/hooks/*        → src/hooks/*
@/i18n/*         → src/i18n/*
@/types/*        → src/types/*
@/messages/*     → messages/*
```

---

## Commands

```bash
npm run dev      # Development với Turbopack
npm run build    # Production build (chạy trước commit)
npm run start    # Chạy production build local
npm run lint     # ESLint check (chạy trước commit)
```

---

## Môi trường

```bash
# .env.local — KHÔNG commit file này
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MyApp
JWT_SECRET=<random 32+ ký tự>
API_BASE_URL=https://api.example.com
SESSION_COOKIE_NAME=session              # optional, default: "session"
NEXT_PUBLIC_API_BASE_URL=               # optional, nếu client cần URL khác server
```