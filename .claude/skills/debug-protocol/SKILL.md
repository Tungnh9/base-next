---
name: debug-protocol
description: Quy trình debug có hệ thống 5 bước (REPRODUCE → LOCALIZE → REDUCE → FIX ROOT CAUSE → GUARD) dành riêng cho base-next, gồm các lỗi Next.js 16 đặc thù (proxy.ts thay middleware, Server/Client Component conflict, MISSING_MESSAGE i18n, auth redirect loop) và quy tắc dừng lại sau 2 lần thử fail. Dùng khi build lỗi, test fail, hoặc behavior sai trong dự án base-next. Chứa các pattern lỗi ĐẶC THÙ của stack base-next — bổ sung cho, không thay thế, debugging tổng quát.
---

# Debug Có Hệ Thống

**Dùng khi:** Build lỗi, test fail, hoặc behavior không đúng.

## 5 bước triage — THEO THỨ TỰ, không nhảy bước

```
Bước 1 — REPRODUCE
  Tái tạo lỗi nhất quán với minimum steps.
  Không làm bước 2 nếu chưa reproduce được.

Bước 2 — LOCALIZE
  Thu hẹp: server hay client? Route nào? Component nào?
  Check: `npm run build` output, browser console, server logs.

Bước 3 — REDUCE
  Tạo minimal case — xóa bớt code cho đến khi chỉ còn phần gây lỗi.

Bước 4 — FIX ROOT CAUSE
  Sửa nguyên nhân, không sửa triệu chứng.
  Nếu patch "ẩn" lỗi thay vì fix: DỪNG và báo cáo.

Bước 5 — GUARD
  Thêm test để lỗi không quay lại.
  Commit: "fix([scope]): [mô tả lỗi và cách fix]"
```

## TypeScript errors — Không dùng `any` để thoát

```ts
// ❌ Patch lỗi TS bằng any
const data: any = response

// ✅ Dùng type guard
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "id" in data
}

// ✅ Dùng unknown + assert
const data = response as unknown as User // chỉ khi chắc chắn về shape
```

## Next.js 16 specific errors

```
Lỗi "middleware not found" hoặc "middleware deprecated":
→ Dùng proxy.ts, không phải middleware.ts

Lỗi "use client" / "use server" conflict:
→ Server Component không được import Client Component trực tiếp vào server logic
→ Tách: page.tsx (Server) → component (Client)

Lỗi i18n "Missing message":
→ Kiểm tra key tồn tại ở CẢ vi.json và en.json
→ Kiểm tra namespace trong useTranslations() khớp với key

Lỗi auth redirect loop:
→ Kiểm tra PUBLIC_PATHS trong proxy.ts
→ Kiểm tra session cookie name trong env
```

## Stop-the-line rule

Nếu sau 2 lần thử vẫn không reproduce được lỗi → DỪNG, báo cáo context đầy đủ, hỏi thêm thông tin.

Build lỗi TypeScript không rõ nguyên nhân cũng là một dạng "dừng lại" — không patch bằng `any` hay ép kiểu để né lỗi, làm theo protocol này (REPRODUCE → LOCALIZE → REDUCE → FIX ROOT CAUSE → GUARD) trước.
