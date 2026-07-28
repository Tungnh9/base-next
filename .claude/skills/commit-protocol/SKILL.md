---
name: commit-protocol
description: 'Quy trình commit & push trong base-next — pre-commit checklist (lint/build/secret-scan), format commit message dạng type(scope): mô tả ngắn (ví dụ feat(auth): thêm đăng nhập Google), branch naming, và trình tự bắt buộc Review → Pre-commit → Commit → Push. Dùng khi user sắp commit, sắp push, hoặc hỏi "commit message nên viết sao". Quy tắc riêng của dự án: merge vào main ngoài hotfix/* luôn phải hỏi trước — chi tiết đầy đủ về git-flow xem .claude/skills/commit-protocol/references/git-flow.md.'
metadata:
  version: "1.0.0"
---

# Commit & Version Control

**Dùng khi:** Sắp commit bất kỳ thay đổi nào.

> Sơ đồ nhánh đầy đủ (main/develop/feature/hotfix), quy tắc chọn base PR, và các bài học thực tế khi merge — xem `.claude/skills/commit-protocol/references/git-flow.md`. Đặc biệt lưu ý: merge vào `main` ngoài `hotfix/*` luôn phải hỏi lại user trước.

## Pre-commit checklist (KHÔNG SKIP)

```
[ ] npm run lint    → 0 error, 0 warning
[ ] npm run build   → build thành công
[ ] Tests liên quan → pass
[ ] Không có file .env.local hoặc secret trong staged files
[ ] git diff --staged → review lại một lần cuối
```

**Script tự động:** `bash .claude/skills/commit-protocol/scripts/pre-commit-check.sh`
Chạy lint + build + secret scan + i18n check, output JSON.

> `npm run build` và README sync check được enforce bởi Husky **pre-push** hook.
> Nếu system files thay đổi mà README.md chưa cập nhật, push sẽ bị block.
> Bypass (chỉ khi biết chắc không cần update docs): `git push --no-verify`

## Commit message format

```
<type>(<scope>): <mô tả ngắn>

Types:
  feat     → tính năng mới
  fix      → bug fix
  refactor → cải thiện code, không thêm feature
  style    → thay đổi UI/style
  test     → thêm/sửa test
  chore    → config, dependencies, tooling
  i18n     → thêm/sửa bản dịch
  docs     → documentation

Scopes (dùng tên feature hoặc layer):
  auth, [feature-name], api, ui, i18n, config

Ví dụ:
  feat(product): add product list with pagination
  fix(auth): handle expired JWT token correctly
  i18n(product): add Vietnamese translations
  refactor(api): extract serverApi into shared util
```

## Branch naming

```
feature/[feature-name]     → tính năng mới
fix/[bug-description]      → bug fix
refactor/[what]            → refactor
chore/[task]               → maintenance
```

## Quy trình đầy đủ: Review → Pre-commit → Commit → Push

```
Bước 1 — Code Review (KHÔNG SKIP)
  Spawn agent với subagent_type="code-reviewer" (hoặc general-purpose)
  Prompt: "Review các thay đổi hiện tại theo 5 review-gates của skill review-gates
           (.claude/skills/review-gates/SKILL.md nếu cần đọc chi tiết đầy đủ).
           Báo cáo: PASS/FAIL từng gate, issue cụ thể (file:line), severity."
  → Nếu FAIL: fix issues → review lại từ đầu
  → Nếu PASS: tiếp tục bước 2

Bước 2 — Pre-commit
  npm run lint && npm run build
  Kiểm tra staged: không có .env.local, không có secret
  git diff --staged

Bước 3 — Commit
  git add [files cụ thể]
  git commit -m "<type>(<scope>): <mô tả>"

Bước 4 — Push
  git push origin [branch]
  Nếu pre-push hook block (README chưa update): cập nhật README → commit docs → push lại
```
