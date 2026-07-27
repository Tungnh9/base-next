---
description: Debug lỗi trong base-next theo debug-protocol (5 bước triage)
argument-hint: [error message / stack trace]
---

Có lỗi sau trong dự án base-next:

$ARGUMENTS

Nếu tôi chưa cung cấp đủ ngữ cảnh, hãy hỏi tôi:

- Xảy ra ở đâu: Route / Component / Action nào
- Khi nào: trigger action gì
- Đã thử gì và không work

Áp dụng skill `debug-protocol`: thực hiện đủ 5 bước triage (REPRODUCE → LOCALIZE → REDUCE → FIX ROOT CAUSE → GUARD). Không patch triệu chứng — fix root cause.
