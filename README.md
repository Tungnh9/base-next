# base-next

Next.js 16 base template — scalable, production-ready, dùng được cho mọi dự án.

## Stack

|               |                                       |
| ------------- | ------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack)    |
| Language      | TypeScript 5 (strict)                 |
| Styling       | Tailwind CSS v4 + shadcn/ui           |
| State         | Zustand                               |
| i18n          | next-intl (vi mặc định, en)           |
| Auth          | JWT via `jose` + cookie httpOnly      |
| Forms         | react-hook-form + Zod                 |
| HTTP Client   | axios (via `ApiClient` class)         |
| Tables        | TanStack Table v8                     |
| Icons         | lucide-react                          |
| Notifications | Sonner + shadcn Toast (Radix)         |
| Rich Text     | TipTap v3 (ProseMirror, @tiptap/core) |

---

## Bắt đầu nhanh

```bash
cp .env.example .env.local   # điền JWT_SECRET và API_BASE_URL
npm install                  # legacy-peer-deps tự động qua .npmrc
npm run dev                  # http://localhost:3000 → redirect /vi
npm run test                 # Vitest watch mode
npm run test:run             # Chạy toàn bộ test một lần (CI / pre-commit)
npm run test:coverage        # Test + coverage report
```

> `.npmrc` đã cấu hình `legacy-peer-deps=true` để xử lý conflict giữa `@emoji-mart/react` và React 19.

> **Node.js:** yêu cầu >= 20.9.0. Dùng `nvm use 22` nếu đang chạy Node 18.

---

## Tài liệu

| File                                           | Nội dung                                      |
| ---------------------------------------------- | --------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)   | Cấu trúc thư mục, path aliases                |
| [docs/auth.md](docs/auth.md)                   | Auth flow, bảo vệ route, mock test cases      |
| [docs/features.md](docs/features.md)           | Thêm tính năng mới, feature-sliced pattern    |
| [docs/api.md](docs/api.md)                     | Gọi API, mock API, server actions             |
| [docs/ui-components.md](docs/ui-components.md) | Toàn bộ UI components, toast                  |
| [docs/editor.md](docs/editor.md)               | Rich text editor (TipTap), extensions, upload |
| [docs/i18n.md](docs/i18n.md)                   | Thêm ngôn ngữ, thêm string dịch               |
| [docs/environment.md](docs/environment.md)     | Biến môi trường                               |
| [docs/contributing.md](docs/contributing.md)   | Commit types, branch naming, quy trình push   |
