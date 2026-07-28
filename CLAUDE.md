@AGENTS.md

# base-next — Quy Tắc Cốt Lõi Cho Agent

Các quy tắc dưới đây áp dụng cho MỌI task trên dự án base-next, không có ngoại lệ — nội dung này luôn nằm trong context, không phụ thuộc vào việc agent có chủ động gọi skill nào hay không.

**Nguyên tắc tuyệt đối:** Code không tồn tại nếu chưa có test. Commit không tồn tại nếu build còn lỗi.

## Surface Assumptions Trước Khi Làm

Trước mọi thay đổi không tầm thường, phải liệt kê explicit:

```
ASSUMPTIONS:
1. [giả định về scope]
2. [giả định về tech]
3. [giả định về data model]
→ Xác nhận trước khi tiến hành.
```

## Không Được Làm (NEVER)

- Commit `.env.local` hoặc bất kỳ file chứa secret
- Dùng `any` trong TypeScript — dùng `unknown` + type guard, kể cả khi không chắc type đúng
- Thêm dependency mới mà không báo trước
- Thay đổi `proxy.ts` hoặc `(protected)/layout.tsx` mà không hỏi trước
- Commit trực tiếp vào `main`
- Xóa test đang fail thay vì fix
- Hardcode string hiển thị dưới bất kỳ hình thức nào — phải qua `next-intl`
- Import trực tiếp từ `node_modules/next/dist/...` — dùng public API
- Đặt business logic trong `page.tsx` / route file thay vì `src/features/[name]/` — route page chỉ là shell mỏng

## Phải Hỏi Trước (ASK FIRST)

- Thay đổi schema authentication hoặc session cookie
- Thêm locale mới vào i18n
- Thay đổi cấu trúc thư mục `src/` (bao gồm tạo file/thư mục ngoài convention `src/features/[name]/{types,schemas,api,actions,hooks,components}` đã định)
- Modify `CLAUDE.md` hoặc `AGENTS.md`
- Thay đổi Next.js config hoặc Tailwind config
- Thêm route mới mà chưa xác định rõ thuộc nhóm `(protected)` hay public
- Merge vào `main` từ nhánh không phải `hotfix/*`

## Luôn Làm (ALWAYS)

- Chạy `npm run build` để verify trước khi commit
- Chạy `npm run lint` và fix hết warning
- Viết test cho mọi function logic phức tạp
- Dùng path alias `@/` thay vì relative path `../../`
- Đặt tên file: `kebab-case.ts`, component: `PascalCase.tsx`

## Trước Khi Kết Thúc Bất Kỳ Task Nào

- [ ] `npm run build` → thành công
- [ ] `npm run lint` → 0 lỗi
- [ ] Feature hoạt động đúng theo acceptance criteria
- [ ] i18n hoạt động ở cả `/vi` và `/en`
- [ ] Auth: route protected chặn đúng, route public không bị chặn
- [ ] Không có `console.error` trong browser
- [ ] Đã commit với message đúng format

## Skills Có Sẵn (`.claude/skills/`)

Claude Code tự động nạp skill phù hợp dựa trên mô tả nhiệm vụ — không cần gọi thủ công.

| Skill                  | Dùng khi                                       |
| ---------------------- | ---------------------------------------------- |
| `context-setup`        | Bắt đầu session mới hoặc chuyển sang task khác |
| `feature-workflow`     | Thêm feature / page / module mới               |
| `component-convention` | Viết React component                           |
| `api-convention`       | Gọi API — Server Action hoặc client fetch      |
| `auth-convention`      | Auth, session, bảo vệ route                    |
| `i18n-workflow`        | Thêm string mới hoặc locale mới (next-intl)    |
| `clone-checklist`      | Clone base-next sang dự án mới                 |
| `debug-protocol`       | Build lỗi, test fail, bug                      |
| `commit-protocol`      | Sắp commit / push                              |
| `review-gates`         | Review code trước khi merge                    |

## Slash Commands Có Sẵn (`.claude/commands/`)

| Command          | Dùng khi                                             |
| ---------------- | ---------------------------------------------------- |
| `/new-feature`   | Bắt đầu feature mới                                  |
| `/new-page`      | Thêm page mới                                        |
| `/new-component` | Tạo component UI mới                                 |
| `/clone-project` | Clone base-next sang dự án mới                       |
| `/debug`         | Debug lỗi theo protocol                              |
| `/review-gates`  | Review toàn branch hoặc 1 feature cụ thể trước merge |
