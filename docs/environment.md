# Biến môi trường

Tất cả biến được validate lúc build bằng Zod (`src/lib/env.ts`). Build sẽ fail nếu thiếu biến bắt buộc.

## Danh sách

| Biến                       | Bắt buộc | Mô tả                                                                     |
| -------------------------- | -------- | ------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`      | ✓        | URL của app (VD: `http://localhost:3000`)                                 |
| `JWT_SECRET`               | ✓        | Khóa ký JWT, tối thiểu 32 ký tự                                           |
| `API_BASE_URL`             | ✓        | URL backend API (server-side)                                             |
| `NEXT_PUBLIC_APP_NAME`     |          | Tên app hiển thị                                                          |
| `SESSION_COOKIE_NAME`      |          | Tên cookie session (mặc định: `session`)                                  |
| `NEXT_PUBLIC_API_BASE_URL` |          | URL backend API (client-side, nếu khác server)                            |
| `NODE_ENV`                 |          | `development` \| `production` \| `test`                                   |
| `NEXT_PUBLIC_USE_MOCK_API` |          | `true` để dùng mock data thay vì gọi backend thật (mặc định `false`)      |
| `MAINTENANCE_MODE`         |          | `true` để redirect toàn bộ traffic sang `/maintenance` (mặc định `false`) |

## Setup

```bash
cp .env.example .env.local
# Điền các giá trị thực vào .env.local
```

Tạo `JWT_SECRET`:

```bash
openssl rand -base64 32
```

> `.env.local` — KHÔNG commit vào git. Chỉ commit `.env.example` (không chứa giá trị thực).
