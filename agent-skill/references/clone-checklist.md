# Clone Checklist Chi Tiết — base-next → Dự Án Mới

Dùng file này khi clone base-next để bắt đầu dự án mới.
Theo thứ tự, không bỏ bước.

---

## Bước 1 — Fork & Setup Local

```bash
# Clone về
git clone https://github.com/Tungnh9/base-next.git [ten-du-an-moi]
cd [ten-du-an-moi]

# Đổi remote origin sang repo mới
git remote set-url origin https://github.com/[username]/[ten-du-an-moi].git

# Setup env
cp .env.example .env.local
```

---

## Bước 2 — Cập Nhật Identity Dự Án

### package.json
```json
{
  "name": "[ten-du-an-moi]",
  "version": "0.1.0"
}
```

### .env.local — PHẢI điền đầy đủ
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=[Tên hiển thị của app]
JWT_SECRET=[random string ≥ 32 ký tự — tạo bằng: openssl rand -base64 32]
API_BASE_URL=https://[backend-url]
SESSION_COOKIE_NAME=session
```

### messages/vi.json + messages/en.json
Đổi tên app trong translation files:
```json
{
  "App": {
    "name": "[Tên app mới]",
    "description": "[Mô tả app mới]"
  }
}
```

---

## Bước 3 — Thay Style

Đây là điểm khác nhau giữa các dự án clone từ base:

### Tailwind CSS Variables (src/app/globals.css hoặc tailwind.config)
```css
/* Đổi màu primary, accent, background theo brand mới */
:root {
  --primary: [hue] [saturation]% [lightness]%;
  --primary-foreground: ...;
}
```

### Font (src/app/[locale]/layout.tsx)
```tsx
import { [FontMới] } from "next/font/google";

const font = [FontMới]({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});
```

### Logo/Favicon
```
Thay file: public/favicon.ico
Thay file: public/logo.svg (nếu có)
```

---

## Bước 4 — Dọn Dẹp Demo Content

```
[ ] Xóa/replace nội dung trang chủ (src/app/[locale]/page.tsx)
[ ] Xóa/replace dashboard demo (src/app/[locale]/(protected)/dashboard/)
[ ] Xóa feature demo nếu có trong src/features/
[ ] Cập nhật README.md với tên + mô tả dự án mới
[ ] Cập nhật CLAUDE.md với context dự án mới
```

---

## Bước 5 — Verify Hoạt Động

```bash
npm install
npm run build    # Phải pass — 0 lỗi
npm run lint     # Phải pass — 0 lỗi
npm run dev      # Chạy development server
```

**Test thủ công:**
```
[ ] http://localhost:3000 → redirect đến /vi
[ ] /vi/login → hiện trang login
[ ] Login với credentials test → redirect dashboard
[ ] /vi/dashboard khi chưa login → redirect /vi/login
[ ] Switch language vi ↔ en → hoạt động
[ ] Theme dark/light → hoạt động (nếu có)
```

---

## Bước 6 — Init Git Mới

```bash
git add -A
git commit -m "chore: initialize [ten-du-an-moi] from base-next"
git push -u origin main
```

---

## Những Gì KHÔNG Thay Đổi Khi Clone

Giữ nguyên các pattern cốt lõi — đây là "khung xương" của base:

| Giữ nguyên | Tại sao |
|------------|---------|
| proxy.ts pattern | Auth architecture đã được kiểm chứng |
| (protected)/layout.tsx | Double-check session bắt buộc |
| src/features/ structure | Convention nhất quán giữa các dự án |
| serverApi / clientApi | Handles auth headers tự động |
| Zod validation pattern | Security layer không được bỏ |
| next-intl setup | i18n infrastructure |
| TypeScript strict mode | Không được tắt |

Chỉ thay đổi: style, content, features cụ thể của dự án mới.