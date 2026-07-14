# Contributing — Quy trình commit & push code

## Commit message format

Dự án dùng **Conventional Commits** — commitlint sẽ từ chối commit nếu không đúng format.

```
<type>(<scope>): <mô tả ngắn>
```

**Ví dụ:**

```
feat(auth): add forgot-password flow
fix(editor): undo button not working after focus loss
chore(deps): upgrade tiptap to 3.28
```

---

## Các type hợp lệ

| Type       | Dùng khi                                                               | Ví dụ                                         |
| ---------- | ---------------------------------------------------------------------- | --------------------------------------------- |
| `feat`     | Thêm tính năng mới cho người dùng                                      | `feat(product): add product list with filter` |
| `fix`      | Sửa bug                                                                | `fix(auth): handle expired JWT correctly`     |
| `refactor` | Cải thiện code, không thêm feature, không sửa bug                      | `refactor(api): extract serverApi to util`    |
| `style`    | Thay đổi UI/CSS thuần túy, không ảnh hưởng logic                       | `style(sidebar): adjust spacing and colors`   |
| `chore`    | Cấu hình, dependencies, tooling, đổi nội dung nhỏ không phải tính năng | `chore(deps): add axios`                      |
| `docs`     | Chỉ thay đổi tài liệu (README, docs/)                                  | `docs(auth): add session cookie explanation`  |
| `test`     | Thêm hoặc sửa test                                                     | `test(auth): add login form test cases`       |
| `perf`     | Cải thiện hiệu năng                                                    | `perf(editor): lazy load echarts`             |
| `build`    | Thay đổi build system (next.config, vite, turbo...)                    | `build: enable turbopack for dev`             |
| `ci`       | Thay đổi CI/CD pipeline                                                | `ci: add github actions workflow`             |
| `revert`   | Revert một commit trước đó                                             | `revert: feat(auth): add sso login`           |

> **Lưu ý:** `i18n` **không** phải type hợp lệ — dùng `chore` cho thay đổi bản dịch nhỏ, `feat` nếu thêm ngôn ngữ mới.

---

## Scope (tuỳ chọn nhưng khuyến khích)

Scope là tên feature hoặc layer bị ảnh hưởng, viết trong ngoặc đơn:

```
feat(product): ...       ← feature cụ thể
fix(auth): ...           ← feature auth
style(ui): ...           ← layer UI
chore(deps): ...         ← dependencies
docs(editor): ...        ← tài liệu editor
```

Bỏ scope khi thay đổi ảnh hưởng toàn bộ dự án:

```
chore: upgrade Node to 20
refactor: migrate to new API pattern
```

---

## Branch naming

| Pattern                   | Dùng cho             |
| ------------------------- | -------------------- |
| `feature/<tên-tính-năng>` | Tính năng mới        |
| `fix/<mô-tả-bug>`         | Bug fix              |
| `refactor/<phạm-vi>`      | Refactor             |
| `chore/<công-việc>`       | Maintenance, tooling |

**Ví dụ:**

```bash
git checkout -b feature/product-management
git checkout -b fix/auth-redirect-loop
git checkout -b chore/upgrade-dependencies
```

---

## Quy trình đầy đủ khi push code

```bash
# 1. Tạo branch từ develop
git checkout develop
git pull origin develop
git checkout -b feature/<tên>

# 2. Code + commit từng slice nhỏ
git add <files cụ thể>
git commit -m "feat(<scope>): <mô tả>"

# 3. Push branch lên remote
git push origin feature/<tên>

# 4. Merge vào develop (sau khi review xong)
git checkout develop
git merge --no-ff feature/<tên>
git push origin develop
```

> Pre-commit hook tự chạy: **test** → **lint** → **prettier** — commit bị block nếu có lỗi.
> Pre-push hook tự chạy: **build** → **README sync check** — push bị block nếu build lỗi hoặc system files thay đổi mà chưa update README.

---

## System files — bắt buộc update README khi thay đổi

Pre-push hook sẽ block nếu thay đổi các file sau mà không cập nhật `README.md`:

| File                  | Lý do cần update docs    |
| --------------------- | ------------------------ |
| `package.json`        | Thêm/xóa dependency      |
| `next.config.ts`      | Thay đổi cấu hình build  |
| `src/proxy.ts`        | Thêm/xóa public route    |
| `src/i18n/config.ts`  | Thêm/xóa locale          |
| `.env.example`        | Thêm/xóa biến môi trường |
| `src/app/globals.css` | Thay đổi CSS global      |

Bypass (chỉ khi chắc chắn không cần update docs):

```bash
git push --no-verify
```
