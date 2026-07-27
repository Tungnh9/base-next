---
description: Thêm page mới vào base-next theo đúng route group và convention component/i18n
argument-hint: [tên-page]
---

Thêm page **$ARGUMENTS** vào base-next.

Nếu tôi chưa cung cấp đủ thông tin, hãy hỏi tôi:

- Route đích: /vi/[path]
- Thuộc route group nào: (auth) hay (protected)
- Nội dung hiển thị
- Cần data từ API nào, hoặc không cần

Áp dụng skill `feature-workflow` (cấu trúc thư mục + vertical slice), `component-convention` (component con), và `i18n-workflow` (mọi string hiển thị phải qua next-intl, không hardcode).
