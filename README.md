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
| Notifications | Sonner                                |
| Rich Text     | TipTap v3 (ProseMirror, @tiptap/core) |

---

## Bắt đầu nhanh

```bash
cp .env.example .env.local   # điền JWT_SECRET và API_BASE_URL
npm install                  # legacy-peer-deps tự động qua .npmrc
npm run dev                  # http://localhost:3000 → redirect /vi
npm run build                # Production build (CI + pre-push hook chạy bước này)
npm run start                # Chạy bản đã build (sau npm run build)
npm run lint                 # ESLint — 0 error trước khi commit
npm run format                # Prettier --write toàn bộ project
npm run test                 # Vitest watch mode
npm run test:run             # Chạy toàn bộ test một lần (CI / pre-commit)
npm run test:coverage        # Test + coverage report
```

> `.npmrc` đã cấu hình `legacy-peer-deps=true` để xử lý conflict giữa `@emoji-mart/react` và React 19.

> **Node.js:** yêu cầu >= 20.9.0 (khai báo trong `package.json` → `engines`, Vercel/CI cũng đọc field này để chọn đúng runtime). Dùng `nvm use 22` nếu đang chạy Node 18.

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

---

## Trang tiện ích (misc)

Các trang public không cần xác thực, không có sidebar/header:

| Route             | Mô tả                |
| ----------------- | -------------------- |
| `/maintenance`    | Trang đang bảo trì   |
| `/coming-soon`    | Trang sắp ra mắt     |
| `/not-authorized` | Trang không có quyền |

Route group `(misc)` — thêm route mới vào `src/app/[locale]/(misc)/` và khai báo trong `src/proxy.ts` → `PUBLIC_PATHS`.

Logic hiển thị đã gắn vào 3 trang này:

- `/maintenance` — bật bằng biến môi trường `MAINTENANCE_MODE=true`; `proxy.ts` redirect toàn bộ traffic sang trang này (trừ chính nó).
- `/not-authorized` — trả về khi `requireRole()` (`src/lib/auth.ts`) phát hiện session không đủ quyền. Ví dụ: route `/employees` yêu cầu role `admin`.
- `/coming-soon` — nội dung (`misc.comingSoon`) được tái sử dụng ở trang `/employees` cho user có quyền nhưng feature chưa build xong.

## Quy ước Button

- Mọi `<button>` đều có `cursor: pointer` (khai báo trong `globals.css @layer base`)
- Trạng thái `disabled` hiển thị `cursor: not-allowed`
- Dùng `<Button>` từ `@/components/ui/button` cho tất cả button trong app
