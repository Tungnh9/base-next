---
name: clone-checklist
description: Checklist khi clone base-next để tạo dự án mới — setup env/JWT, đổi style (màu/font/logo), xóa feature demo, và verify build/lint/login/i18n trước khi bàn giao. Dùng khi user nói "clone dự án này", "tạo dự án mới từ base-next", hoặc "chuẩn bị base cho client mới". Không dùng cho việc thêm feature vào dự án đã clone xong (xem feature-workflow).
metadata:
  version: "1.0.0"
---

# Clone Base Sang Dự Án Mới

**Dùng khi:** Tạo dự án mới từ base-next.

## Checklist bắt buộc

```
CLONE CHECKLIST — dự án: [Tên dự án mới]

Setup:
[ ] Fork / clone repo
[ ] Đổi "name" trong package.json
[ ] Đổi NEXT_PUBLIC_APP_NAME trong .env.local
[ ] Tạo .env.local từ .env.example
[ ] Điền JWT_SECRET (tối thiểu 32 ký tự, random)
[ ] Điền API_BASE_URL của backend mới
[ ] npm install

Style (thay đổi để khác base):
[ ] Đổi màu primary trong tailwind.config (hoặc CSS variables)
[ ] Đổi font nếu cần (layout.tsx)
[ ] Đổi tên app trong messages/vi.json + en.json
[ ] Thay logo/favicon trong public/

Content:
[ ] Xóa feature demo nếu có
[ ] Cập nhật README.md với tên dự án mới
[ ] Cập nhật CLAUDE.md với context dự án mới

Verify:
[ ] npm run build → không có lỗi
[ ] npm run lint → không có warning
[ ] Test login flow hoạt động
[ ] Test route protection hoạt động
[ ] Test i18n switch vi/en hoạt động
```

## Những gì KHÔNG thay đổi khi clone

```
Giữ nguyên kiến trúc:
✓ proxy.ts pattern (chỉ update PUBLIC_PATHS)
✓ (protected)/layout.tsx pattern
✓ src/features/ structure
✓ serverApi / clientApi pattern
✓ Zod schema validation pattern
✓ next-intl configuration
```
