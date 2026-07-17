# Git Flow — base-next

Quy trình nhánh/merge cho project này. Áp dụng cho cả solo dev lẫn team nhiều người sau này — phần "Bài học thực tế" dưới đây đúc kết từ các lần agent thực sự làm việc trên repo này, không phải lý thuyết chung chung.

---

## Sơ đồ nhánh

```
main        ── production. CHỈ nhận code qua merge từ develop (release) hoặc hotfix/*.
 │
develop     ── nhánh tích hợp. Mọi feature/*, fix/* merge vào đây trước.
 │
feature/*   ── tính năng mới, tách từ develop.
fix/*       ── sửa lỗi thường, tách từ develop.
hotfix/*    ── sửa khẩn cấp trên production, tách từ main.
              Merge xong phải đưa vào CẢ main VÀ develop (không chỉ main),
              nếu không lần release sau code cũ sẽ quay lại (develop không có bản vá).
```

## ⚠️ Quy tắc bắt buộc xác nhận

**Bất kỳ yêu cầu merge vào `main` nào không phải từ nhánh `hotfix/*` đều phải hỏi lại user trước khi làm** — kể cả khi user đang yêu cầu agent tự chạy liền mạch các bước khác không cần hỏi. Đây là ngoại lệ duy nhất không được tự động hóa.

---

## Quy trình chuẩn mỗi feature/fix

1. Tạo branch mới từ `develop` (không code thẳng trên `develop`).
2. Code + viết test.
3. **Review** — spawn agent (`code-reviewer` nếu môi trường có, hoặc `general-purpose` nếu không) review theo 5 review-gates trong `SKILL.md`. Nếu FAIL blocking issue: dừng lại sửa trước, không bỏ qua bước này dù đang ở chế độ "tiến hành liền mạch".
4. **Pre-commit** — `npm run lint` + `npm run test:run`, kiểm tra staged không dính `.env.local`/secret.
5. **Commit** — format `<type>(<scope>): <mô tả>` theo `commit-protocol` trong `SKILL.md`.
6. **Push**.
7. Mở PR nhắm base = `develop` (double-check dòng "wants to merge ... into `X` from `Y`" trước khi tạo — xem bài học bên dưới).
8. Merge PR (khi có nhiều người: bắt buộc ít nhất 1 approval + status check pass trước khi merge — cần bật branch protection trên GitHub, xem mục cuối).

---

## Bài học thực tế đã gặp trong chính project này

- **PR nhắm nhầm base `main` thay vì `develop`** — đã xảy ra thật 1 lần. Trước khi tạo PR, luôn nhìn kỹ dòng "wants to merge N commits into `main`/`develop` from `<branch>`". Nếu lỡ tạo nhầm và PR chưa merge: sửa base ngay trên GitHub (bấm trực tiếp vào tên base branch trong dòng đó để mở dropdown chọn lại) — không cần đóng/mở lại PR.
- **Pre-push hook chạy `npm run build`, yêu cầu Node ≥20.9** — máy có thể đang mặc định Node 18 (`nvm`), khiến `git push`/`git commit` fail ở bước husky. Luôn `nvm use 22` (hoặc bất kỳ bản ≥20.9 có sẵn) trước khi commit/push.
- **`npm run build` để tự verify trong lúc có dev server khác đang chạy sẽ làm hỏng `.next` cache dùng chung** — gây lỗi khó hiểu kiểu `MISSING_MESSAGE` dù code hoàn toàn đúng. Nếu biết có dev server đang mở song song, ưu tiên `npm run lint` + `npx tsc --noEmit` để verify, để dành `npm run build` cho lúc thật sự cần hoặc để pre-push hook tự chạy.
- **Nhiều branch tách từ `develop` cùng lúc, sửa chung file → conflict thật khi merge sau** — không phải lỗi thao tác, là hệ quả tự nhiên của làm việc song song. Nên merge/rebase `develop` mới nhất vào branch của mình sớm (trước khi mở PR) để lộ conflict sớm, dễ resolve hơn là để dồn đến lúc merge cuối cùng với nhiều thay đổi chồng chéo.
- **Chưa bật branch protection trên GitHub** — hiện tại ai có quyền push đều bấm "Merge pull request" được luôn, không bắt buộc review hay status check pass trước. Cần vào GitHub → Settings → Branches → bật "Require pull request reviews before merging" + "Require status checks to pass" cho cả `main` và `develop`. Việc này phải làm trên GitHub UI, ngoài khả năng thao tác trực tiếp của agent — chỉ có thể nhắc, không tự bật được.
- **Không paste token GitHub thô vào chat để agent dùng** — token sẽ lưu lại trong lịch sử hội thoại/log, coi như lộ dù chỉ dùng 1 lần. Ưu tiên: user tự `gh auth login` (nếu có `gh` CLI), hoặc SSH key (repo này đã setup sẵn `~/.ssh/id_ed25519_github` + `~/.ssh/config` cho `github.com`) — cả 2 cách đều để agent thao tác được mà không cần thấy secret.

---

## Xóa branch sau khi merge?

Mặc định (team nhiều người, quy trình chuẩn): xóa branch sau khi PR merge, để repo gọn — GitHub có tùy chọn tự xóa khi merge.

**Lưu ý riêng cho agent làm việc trên repo này**: không tự ý xóa branch sau khi merge trừ khi user yêu cầu rõ — một số session làm việc vẫn cần giữ lại branch cũ để đối chiếu/tham khảo sau này.
