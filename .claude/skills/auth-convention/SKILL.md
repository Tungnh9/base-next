---
name: auth-convention
description: Kiến trúc authentication 2 tầng của base-next (proxy.ts network-level + (protected)/layout.tsx server-level), cách thêm route public vào PUBLIC_PATHS, cách đọc session bằng getSession(), và các rule JWT bắt buộc. Dùng khi user yêu cầu "thêm route công khai", "sửa proxy.ts", "kiểm tra session", hoặc bất kỳ thay đổi nào liên quan login/logout/protected route. Khu vực nhạy cảm — thay đổi schema auth hoặc session cookie phải hỏi trước.
---

# Authentication & Route Protection

**Dùng khi:** Làm việc với auth, session, hoặc bảo vệ route.

## Kiến trúc 2 tầng (KHÔNG thay đổi mà không hỏi)

```
Tầng 1 — proxy.ts (Network level):
  → Chặn trước khi render
  → Redirect /login nếu không có session cookie
  → Kiểm tra PUBLIC_PATHS để bypass

Tầng 2 — (protected)/layout.tsx (Server Component level):
  → Double-check session ở server
  → Fallback nếu proxy bị bypass
```

## Thêm route công khai (không cần auth)

```ts
// proxy.ts — thêm vào PUBLIC_PATHS
const PUBLIC_PATHS = [
  "/",
  "/vi/login",
  "/en/login",
  "/vi/register",
  "/en/register",
  "/vi/[route-mới]", // ← Thêm đây
  "/en/[route-mới]",
]
```

## Session handling

```ts
// Đọc session — dùng helper có sẵn
import { getSession } from "@/lib/auth"

// Trong Server Component
const session = await getSession()
if (!session) redirect("/login")

// KHÔNG tự đọc cookie trực tiếp — dùng getSession()
```

## JWT Rules

- Secret phải ≥ 32 ký tự trong `JWT_SECRET` env
- Token expire phải set explicit
- KHÔNG lưu sensitive data trong JWT payload
- Cookie phải có `httpOnly: true, secure: true, sameSite: "lax"`
