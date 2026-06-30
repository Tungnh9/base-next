# Prompt: Bắt Đầu Feature Mới

Copy prompt này và điền vào [brackets] trước khi gửi cho Claude Code.

---

## Prompt mẫu

```
Tôi muốn thêm feature [TÊN FEATURE] vào dự án base-next.

Mô tả: [Tính năng này làm gì? User cần gì?]

Scope lần này:
- [Việc 1]
- [Việc 2]

Không làm lần này:
- [Việc để sau]

Hãy bắt đầu bằng cách đọc agent-skill/SKILL.md và thực hiện theo [feature-workflow]:
1. Tạo spec trước khi viết code
2. Hỏi tôi xác nhận spec trước khi tiến hành
3. Implement theo vertical slices, commit sau mỗi slice
```

---

## Prompt: Thêm Page Mới (Đơn giản)

```
Thêm page [TÊN PAGE] vào route [/vi/PATH].

Page này:
- Thuộc route group: [(auth) hoặc (protected)]
- Hiển thị: [Mô tả nội dung]
- Cần data từ API: [Endpoint nào, hoặc "không cần"]

Đọc agent-skill/SKILL.md trước khi bắt đầu.
Nhớ: string hiển thị phải qua next-intl, không hardcode.
```

---

## Prompt: Thêm Component UI

```
Tạo component [TÊN COMPONENT] cho feature [FEATURE].

Props cần có:
- [prop1]: [type] — [mô tả]
- [prop2]: [type] — [mô tả]

Behavior:
- [Mô tả behavior]

Dùng shadcn/ui nếu có component phù hợp.
Đặt file ở src/features/[feature]/components/[name].tsx.
```

---

## Prompt: Bắt Đầu Session Mới

```
Bắt đầu session làm việc trên base-next.

Đọc theo thứ tự:
1. CLAUDE.md
2. AGENTS.md  
3. README.md
4. agent-skill/SKILL.md

Task hôm nay: [Mô tả task]

Liệt kê assumptions trước khi bắt đầu.
```

---

## Prompt: Clone Sang Dự Án Mới

```
Tôi muốn clone base-next để tạo dự án mới tên [TÊN DỰ ÁN].

Thông tin dự án mới:
- Tên hiển thị: [App name]
- Màu chủ đạo (primary color): [Mô tả màu hoặc hex]
- Font: [Tên font hoặc "giữ nguyên"]
- Backend API URL: [URL hoặc "chưa có"]

Đọc agent-skill/references/clone-checklist.md và thực hiện từng bước.
Báo cáo khi hoàn thành mỗi bước chính.
```

---

## Prompt: Debug Lỗi

```
Có lỗi sau trong dự án base-next:

[PASTE ERROR MESSAGE / STACK TRACE]

Ngữ cảnh:
- Xảy ra ở đâu: [Route / Component / Action]
- Khi nào: [Trigger action gì]
- Đã thử: [Những gì đã thử và không work]

Đọc agent-skill/SKILL.md phần [debug-protocol] và thực hiện 5 bước triage.
Không patch triệu chứng — fix root cause.
```
