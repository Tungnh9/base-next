---
description: Tạo component UI mới cho một feature trong base-next theo component-convention
argument-hint: "[tên-component] [feature]"
---

Tạo component **$ARGUMENTS** trong base-next.

Nếu tôi chưa cung cấp đủ thông tin, hãy hỏi tôi:

- Component này thuộc feature nào
- Props cần có (tên, type, mô tả)
- Behavior mong muốn

Áp dụng skill `component-convention`: named export, dùng shadcn/ui nếu có component phù hợp trước khi tạo mới, đặt file ở `src/features/[feature]/components/[name].tsx`.
