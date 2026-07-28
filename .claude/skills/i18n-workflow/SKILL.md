---
name: i18n-workflow
description: Quy trình next-intl bắt buộc trong base-next — không hardcode string hiển thị, luôn thêm key vào messages/vi.json TRƯỚC rồi mới messages/en.json, cách thêm locale mới (phải hỏi trước), và script verify đồng bộ agent-skill/scripts/check-i18n.sh. Dùng khi user yêu cầu "thêm string mới", "dịch UI", "thêm ngôn ngữ", hoặc khi phát hiện text hiển thị bị hardcode.
metadata:
  version: "1.0.0"
---

# Internationalization

**Dùng khi:** Thêm string mới, page mới, hoặc locale mới.

## Rule tuyệt đối: KHÔNG hardcode string hiển thị

```tsx
// ❌ SAI
<h1>Chào mừng</h1>
<Button>Đăng nhập</Button>

// ✅ ĐÚNG
const t = useTranslations("HomePage");
<h1>{t("welcome")}</h1>
<Button>{t("login")}</Button>
```

## Thêm string mới

```
1. Thêm vào messages/vi.json TRƯỚC
2. Thêm cùng key vào messages/en.json
3. Dùng trong component qua useTranslations()
4. Không để key thiếu ở một ngôn ngữ
```

```json
// messages/vi.json
{
  "[FeatureName]": {
    "title": "Tiêu đề",
    "description": "Mô tả",
    "actions": {
      "create": "Tạo mới",
      "edit": "Chỉnh sửa",
      "delete": "Xóa"
    }
  }
}

// messages/en.json — cùng structure, khác value
{
  "[FeatureName]": {
    "title": "Title",
    "description": "Description",
    "actions": {
      "create": "Create",
      "edit": "Edit",
      "delete": "Delete"
    }
  }
}
```

## Thêm locale mới (ASK FIRST)

```
1. Thêm locale vào src/i18n/config.ts
2. Tạo messages/[locale].json
3. Kiểm tra proxy.ts có cần update PUBLIC_PATHS không
4. next-intl tự xử lý routing
```

**Verify i18n sync:** `bash agent-skill/scripts/check-i18n.sh`
Output JSON với danh sách keys thiếu ở mỗi ngôn ngữ.
