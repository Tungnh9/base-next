# Prompt: Review Code Trước Merge

---

## Prompt: Self-Review (Claude tự review)

```
Review code trong branch hiện tại trước khi merge vào main.

Thực hiện theo agent-skill/SKILL.md phần [review-gates]:

Gate 1 — Build & Lint:
  npm run build
  npm run lint

Gate 2 — Kiến trúc:
  - Feature code nằm đúng src/features/?
  - Page chỉ là shell mỏng?
  - Không có relative path dài?

Gate 3 — Convention:
  - Không có hardcode string?
  - Không có TypeScript any?
  - Named exports?

Gate 4 — Security:
  - Không có secret trong code?
  - Input được validate bằng Zod?
  - Route auth đúng group?

Gate 5 — i18n:
  - Mọi key có trong cả vi.json và en.json?

Báo cáo kết quả từng gate. List cụ thể những gì cần sửa.
```

---

## Prompt: Review Feature Cụ Thể

```
Review feature [TÊN FEATURE] vừa implement xong.

Files liên quan:
- src/features/[name]/
- src/app/[locale]/(protected)/[name]/

Kiểm tra:
1. Cấu trúc đúng convention chưa (types, schemas, api, actions, components)?
2. Zod validate đủ chưa?
3. i18n đủ key ở cả hai ngôn ngữ chưa?
4. Server Component và Client Component tách đúng chưa?
5. Error handling đủ chưa (loading state, error state, empty state)?

Chỉ ra cụ thể file + line nếu có vấn đề.
```
