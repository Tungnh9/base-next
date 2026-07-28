---
name: context-setup
description: Thiết lập context khi bắt đầu session làm việc mới trên base-next hoặc khi chuyển sang task khác trong repo này. Dùng khi user nói "bắt đầu session mới", "đọc context dự án trước khi code", hoặc "đổi task khác", hoặc khi agent cần biết đọc file nào theo thứ tự nào (CLAUDE.md, AGENTS.md, README.md), cách xác định context của task (feature/UI/auth), và cần được nhắc về breaking changes của Next.js 16 trong dự án base-next trước khi viết code. KHÔNG dùng cho việc implement feature cụ thể (xem feature-workflow) hay debug lỗi (xem debug-protocol).
metadata:
  version: "1.0.0"
---

# Bắt Đầu Session

**Dùng khi:** Bắt đầu session mới hoặc switch sang task khác.

**Bước 1 — Load context cốt lõi:**

```
Đọc theo thứ tự:
1. CLAUDE.md  → Rules project-wide (luôn có sẵn trong context)
2. AGENTS.md  → Agent-specific rules (Next.js breaking changes)
3. README.md  → Stack, cấu trúc, conventions

Chi tiết theo từng chủ đề nằm trong .claude/skills/*, Claude Code tự nạp khi cần — không cần đọc thủ công.
```

**Bước 2 — Xác định context của task:**

```
Task liên quan đến feature X?
→ Đọc src/features/[X]/ nếu đã tồn tại
→ Đọc src/app/[locale]/(protected hoặc auth)/[X]/ nếu có route

Task liên quan đến UI?
→ Đọc src/components/ui/ để biết component có sẵn
→ Đọc components.json để biết shadcn config

Task liên quan đến auth?
→ Đọc proxy.ts + src/app/[locale]/(protected)/layout.tsx
```

**Bước 3 — Nhận diện version Next.js:**

```
⚠️ Đây là Next.js 16 — có breaking changes so với 14/15.
- middleware.ts → KHÔNG dùng, thay bằng proxy.ts
- Đọc AGENTS.md trước khi viết bất kỳ Next.js code nào
```

## Tài liệu tham khảo thêm

- `agent-skill/assets/folder-structure.md` — bản đồ đầy đủ cấu trúc thư mục dự án. Đọc khi cần biết chính xác nên đặt file mới ở đâu, chi tiết hơn phần tóm tắt ở Bước 2.
- `agent-skill/assets/stack-overview.md` — tổng quan dependency map của tech stack (package nào, version nào). Lưu ý: danh sách dependency trong file này có thể đã cũ hơn package.json hiện tại — luôn đối chiếu package.json nếu cần con số chính xác, đừng coi file này là nguồn chính xác tuyệt đối.
