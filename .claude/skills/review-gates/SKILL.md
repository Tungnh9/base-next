---
name: review-gates
description: 5 quality gate bắt buộc trước khi merge code trong base-next — Gate 1 Build & Lint, Gate 2 Kiến trúc, Gate 3 Convention, Gate 4 Security, Gate 5 i18n, mỗi gate là một checklist cụ thể theo convention của dự án này. Dùng khi cần tự-review code trước merge hoặc khi được yêu cầu review theo checklist chuẩn của base-next. Checklist NỘI DUNG cụ thể (đường dẫn file, quy ước đặt tên, pattern serverApi/clientApi...) — bổ sung cho, không thay thế, review chất lượng tổng quát dạng code-review/security-review.
---

# Quality Gates Trước Khi Merge

**Dùng khi:** Chuẩn bị merge vào main.

## Gate 1 — Build & Lint

```bash
npm run build   # Phải pass — không có TS error, không có build error
npm run lint    # Phải pass — 0 error
```

## Gate 2 — Kiến trúc

```
[ ] Feature code nằm trong src/features/[name]/ — không scattered
[ ] Page component chỉ là shell mỏng, không có business logic
[ ] Không có import vòng tròn
[ ] Không có relative path dài (../../..) — dùng @/ alias
[ ] Không có unused import
```

## Gate 3 — Convention

```
[ ] Không có string hardcode — tất cả qua next-intl
[ ] Không có any trong TypeScript
[ ] Named exports (không default export với component)
[ ] File đặt tên đúng: kebab-case.tsx
[ ] Zod schema validate mọi external input
```

## Gate 4 — Security

```
[ ] Không commit secret hoặc .env.local
[ ] User input được validate bằng Zod trước khi xử lý
[ ] API calls đi qua serverApi/clientApi — không fetch trực tiếp
[ ] Route mới cần auth đã được thêm vào (protected)/ group
[ ] Route mới public đã được thêm vào PUBLIC_PATHS
```

## Gate 5 — i18n

```
[ ] Mọi string mới đã có trong vi.json VÀ en.json
[ ] Không có key thiếu ở một ngôn ngữ
[ ] Namespace trong useTranslations() khớp với key trong JSON
```
