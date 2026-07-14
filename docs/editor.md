# Rich Text Editor

`src/components/editor/` — dùng TipTap v3 (ProseMirror).

## Usage

```tsx
import { RichTextEditor, RichTextViewer } from "@/components/editor"
import type { JSONContent } from "@tiptap/react"

// Controlled editor (lưu dạng JSON)
const [content, setContent] = useState<JSONContent>()
<RichTextEditor value={content} onChange={setContent} />

// Read-only viewer (Server Component)
<RichTextViewer content={content} />
```

## Toolbar

Undo/Redo · Heading · Bold/Italic/Underline/Strike/Code · Text color · Highlight · Alignment · Lists · Checklist · Link · Image (upload + URL) · Video (YouTube/Vimeo/URL) · Chart (bar/line/pie via ECharts) · Table · HR · Emoji picker · Clear format.

## Extensions

| Extension   | Mô tả                                       |
| ----------- | ------------------------------------------- |
| `@mention`  | Popup danh sách user khi gõ `@`             |
| `/slash`    | Popup chọn block type khi gõ `/`            |
| Video embed | Nhúng YouTube, Vimeo, hoặc URL video bất kỳ |
| Chart node  | Biểu đồ bar/line/pie qua ECharts            |

## Upload ảnh

`POST /api/upload` — auth required, `image/*` only, max 5MB, lưu vào `public/uploads/`.

> **Production:** thay bằng S3/R2 — sửa `src/app/api/upload/route.ts`.
