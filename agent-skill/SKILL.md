---
name: agent-skill
description: Bộ skill cho dự án base-next — Next.js 16 App Router, TypeScript strict, Tailwind v4, shadcn/ui, Zustand, next-intl, JWT auth. Dùng khi bắt đầu session mới, thêm feature, debug, hoặc chuẩn bị clone base cho dự án mới.
---

# base-next Agent Skill

## Overview

Đây là bộ skill điều phối toàn bộ workflow phát triển trên dự án `base-next` — một Next.js 16 base template được thiết kế để tái sử dụng cho nhiều dự án bằng cách thay style. Skill này giúp agent luôn đúng convention, đúng cấu trúc, và không phá vỡ các ràng buộc kiến trúc đã định.

**Nguyên tắc tuyệt đối:** Code không tồn tại nếu chưa có test. Commit không tồn tại nếu build còn lỗi.

---

## Skill Discovery — Dùng skill nào khi nào?

```
Yêu cầu đến
    │
    ├── Bắt đầu session / switch task? ──────────→ [context-setup]
    │
    ├── Thêm feature / page mới? ────────────────→ [feature-workflow]
    │   ├── Cần UI component? ──────────────────→ [component-convention]
    │   ├── Cần gọi API? ───────────────────────→ [api-convention]
    │   └── Cần thêm ngôn ngữ? ─────────────────→ [i18n-workflow]
    │
    ├── Clone base sang dự án mới? ─────────────→ [clone-checklist]
    │
    ├── Xử lý auth / bảo vệ route? ─────────────→ [auth-convention]
    │
    ├── Build lỗi / test fail / bug? ───────────→ [debug-protocol]
    │
    ├── Sắp commit / merge? ─────────────────────→ [commit-protocol]
    │
    └── Review code trước merge? ───────────────→ [review-gates]
```

---

## Core Operating Rules (Bất biến)

Những quy tắc này áp dụng mọi lúc, không có ngoại lệ:

### 1. Surface Assumptions Trước Khi Làm

Trước mọi thay đổi không tầm thường, phải liệt kê explicit:

```
ASSUMPTIONS:
1. [giả định về scope]
2. [giả định về tech]
3. [giả định về data model]
→ Xác nhận trước khi tiến hành.
```

### 2. Không Được Làm (NEVER)

- ❌ Commit `.env.local` hoặc bất kỳ file chứa secret
- ❌ Dùng `any` trong TypeScript — dùng `unknown` + type guard
- ❌ Thêm dependency mới mà không báo trước
- ❌ Thay đổi `proxy.ts` hoặc `(protected)/layout.tsx` mà không hỏi
- ❌ Commit trực tiếp vào `main`
- ❌ Xóa test đang fail thay vì fix
- ❌ Hardcode string hiển thị — phải qua `next-intl`
- ❌ Import trực tiếp từ `node_modules/next/dist/...` — dùng public API

### 3. Phải Hỏi Trước (ASK FIRST)

- Thay đổi schema authentication hoặc session cookie
- Thêm locale mới vào i18n
- Thay đổi cấu trúc thư mục `src/`
- Modify `CLAUDE.md` hoặc `AGENTS.md`
- Thay đổi Next.js config hoặc Tailwind config

### 4. Luôn Làm (ALWAYS)

- Chạy `npm run build` để verify trước khi commit
- Chạy `npm run lint` và fix hết warning
- Viết test cho mọi function logic phức tạp
- Dùng path alias `@/` thay vì relative path `../../`
- Đặt tên file: `kebab-case.ts`, component: `PascalCase.tsx`

---

## [context-setup] — Bắt Đầu Session

**Dùng khi:** Bắt đầu session mới hoặc switch sang task khác.

**Bước 1 — Load context cốt lõi:**

```
Đọc theo thứ tự:
1. CLAUDE.md        → Rules project-wide
2. AGENTS.md        → Agent-specific rules (Next.js breaking changes)
3. README.md        → Stack, cấu trúc, conventions
4. agent-skill/SKILL.md → File này
```

**Bước 2 — Xác định context của task:**

```
Task liên quan đến feature X?
→ Đọc src/features/[X]/ nếu đã tồn tại
→ Đọc src/app/[locale]/(protected hoặc auth)/[X]/ nếu có route

Task liên quan đến UI?
→ Đọc src/components/ui/ để biết component có sẵn
→ Đọc components.json để biết shadcn config

Task liên quan đến auth?
→ Đọc proxy.ts + src/app/[locale]/(protected)/layout.tsx
```

**Bước 3 — Nhận diện version Next.js:**

```
⚠️ Đây là Next.js 16 — có breaking changes so với 14/15.
- middleware.ts → KHÔNG dùng, thay bằng proxy.ts
- Đọc AGENTS.md trước khi viết bất kỳ Next.js code nào
```

---

## [feature-workflow] — Thêm Feature Mới

**Dùng khi:** Thêm tính năng, page, hoặc module mới.

### Phase 1: Specify (KHÔNG BỎ QUA)

Trước khi viết code, tạo spec tối thiểu:

```markdown
## Feature: [Tên]

### Objective

[Tính năng này làm gì? User cần gì?]

### Scope

- Sẽ làm: [...]
- Không làm lần này: [...]

### Files sẽ thay đổi

- [ ] src/features/[name]/types.ts
- [ ] src/features/[name]/schemas.ts
- [ ] src/features/[name]/api.ts hoặc actions.ts
- [ ] src/features/[name]/components/
- [ ] src/app/[locale]/(protected)/[name]/page.tsx
- [ ] messages/vi.json + messages/en.json

### Acceptance Criteria

- [ ] [Điều kiện cụ thể, testable]
- [ ] [Điều kiện cụ thể, testable]
```

### Phase 2: Tạo cấu trúc thư mục

**Convention bắt buộc** — mọi feature đều theo pattern này:

```
src/features/[feature-name]/
├── types.ts          # TypeScript types + interfaces
├── schemas.ts        # Zod validation schemas
├── api.ts            # Client-side fetching (useQuery pattern)
├── actions.ts        # Server Actions (mutations)
├── hooks/
│   └── use-[name].ts # Custom hooks của feature
└── components/
    ├── [name]-list.tsx
    ├── [name]-form.tsx
    └── [name]-card.tsx
```

**Route page — shell mỏng, không logic:**

```tsx
// src/app/[locale]/(protected)/[feature]/page.tsx
import { FeatureList } from "@/features/[feature]/components/[feature]-list"

export default function FeaturePage() {
  return <FeatureList />
}
```

**Scaffold tự động:** `bash agent-skill/scripts/scaffold-feature.sh <feature-name>`
Tạo đủ types.ts, schemas.ts, api.ts, actions.ts, components/, route page.tsx.

### Phase 3: Implement theo vertical slices

```
Slice 1: Types + Schemas
  → types.ts + schemas.ts + unit test schemas
  → Commit: "feat([name]): add types and zod schemas"

Slice 2: API layer
  → api.ts hoặc actions.ts + integration test
  → Commit: "feat([name]): add API client/server actions"

Slice 3: UI Components
  → components/*.tsx + component tests
  → Commit: "feat([name]): add UI components"

Slice 4: Route + i18n
  → page.tsx + messages/vi.json + messages/en.json
  → Commit: "feat([name]): add route and i18n strings"

Slice 5: Verify end-to-end
  → npm run build && npm run lint
  → Commit: "feat([name]): complete feature implementation"
```

---

## [component-convention] — Viết Component

**Dùng khi:** Tạo React component bất kỳ.

### Template chuẩn

```tsx
// src/features/[feature]/components/[name].tsx
import { type FC } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// Types định nghĩa ở features/[feature]/types.ts — import từ đó
import type { [FeatureName] } from "../types";

interface [ComponentName]Props {
  // Props explicit, không dùng spread vô tội vạ
  data: [FeatureName];
  className?: string;
  onAction?: (id: string) => void;
}

export const [ComponentName]: FC<[ComponentName]Props> = ({
  data,
  className,
  onAction,
}) => {
  const t = useTranslations("[namespace]");

  return (
    <div className={cn("base-classes", className)}>
      {/* Không hardcode string — dùng t() */}
      <h2>{t("title")}</h2>
    </div>
  );
};
```

### Rules

| Rule         | Đúng                               | Sai                      |
| ------------ | ---------------------------------- | ------------------------ |
| Export       | Named export                       | Default export           |
| String       | `t("key")`                         | `"Tiêu đề"` hardcode     |
| ClassName    | `cn("a", condition && "b")`        | String concatenation     |
| Icon         | `import { X } from "lucide-react"` | Emoji hoặc SVG inline    |
| State global | Zustand store                      | useState xuyên component |
| Type         | Explicit interface                 | `any` hoặc `object`      |

### shadcn/ui Component

Dùng component có sẵn trước khi tạo mới:

```tsx
// ✅ Dùng shadcn
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Toast } from "@/components/ui/toast" // dùng sonner

// Thêm component mới từ shadcn — hỏi trước
// npx shadcn@latest add [component-name]
```

---

## [api-convention] — Gọi API

**Dùng khi:** Cần fetch data hoặc mutation.

### Server-side (Server Component, Server Action, Route Handler)

```ts
// src/features/[feature]/actions.ts
"use server";

import { serverApi } from "@/lib/api";
import { [Schema] } from "./schemas";

export async function create[Feature](formData: FormData) {
  // 1. Parse + validate
  const parsed = [Schema].safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  // 2. Gọi API — serverApi tự lấy session cookie
  const { data, error } = await serverApi<[FeatureType]>(
    "/[endpoint]",
    { method: "POST", body: JSON.stringify(parsed.data) }
  );

  if (error) return { error };
  return { data };
}
```

### Client-side (Client Component)

```ts
// src/features/[feature]/api.ts
import { clientApi } from "@/lib/api";
import type { [FeatureType] } from "./types";

export async function get[Feature]List() {
  // clientApi — cần truyền token tường minh nếu cần
  return clientApi<[FeatureType][]>("/[endpoint]");
}
```

### Pattern ApiResponse

```ts
// Luôn destructure đúng pattern
const { data, error } = await serverApi<T>(...);

// Handle error trước
if (error) {
  // log, toast, hoặc throw
  return;
}

// Dùng data — đã được type safely
```

---

## [auth-convention] — Authentication & Route Protection

**Dùng khi:** Làm việc với auth, session, hoặc bảo vệ route.

### Kiến trúc 2 tầng (KHÔNG thay đổi mà không hỏi)

```
Tầng 1 — proxy.ts (Network level):
  → Chặn trước khi render
  → Redirect /login nếu không có session cookie
  → Kiểm tra PUBLIC_PATHS để bypass

Tầng 2 — (protected)/layout.tsx (Server Component level):
  → Double-check session ở server
  → Fallback nếu proxy bị bypass
```

### Thêm route công khai (không cần auth)

```ts
// proxy.ts — thêm vào PUBLIC_PATHS
const PUBLIC_PATHS = [
  "/",
  "/vi/login",
  "/en/login",
  "/vi/register",
  "/en/register",
  "/vi/[route-mới]", // ← Thêm đây
  "/en/[route-mới]",
]
```

### Session handling

```ts
// Đọc session — dùng helper có sẵn
import { getSession } from "@/lib/auth"

// Trong Server Component
const session = await getSession()
if (!session) redirect("/login")

// KHÔNG tự đọc cookie trực tiếp — dùng getSession()
```

### JWT Rules

- Secret phải ≥ 32 ký tự trong `JWT_SECRET` env
- Token expire phải set explicit
- KHÔNG lưu sensitive data trong JWT payload
- Cookie phải có `httpOnly: true, secure: true, sameSite: "lax"`

---

## [i18n-workflow] — Internationalization

**Dùng khi:** Thêm string mới, page mới, hoặc locale mới.

### Rule tuyệt đối: KHÔNG hardcode string hiển thị

```tsx
// ❌ SAI
<h1>Chào mừng</h1>
<Button>Đăng nhập</Button>

// ✅ ĐÚNG
const t = useTranslations("HomePage");
<h1>{t("welcome")}</h1>
<Button>{t("login")}</Button>
```

### Thêm string mới

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

### Thêm locale mới (ASK FIRST)

```
1. Thêm locale vào src/i18n/config.ts
2. Tạo messages/[locale].json
3. Kiểm tra proxy.ts có cần update PUBLIC_PATHS không
4. next-intl tự xử lý routing
```

**Verify i18n sync:** `bash agent-skill/scripts/check-i18n.sh`
Output JSON với danh sách keys thiếu ở mỗi ngôn ngữ.

---

## [clone-checklist] — Clone Base Sang Dự Án Mới

**Dùng khi:** Tạo dự án mới từ base-next.

### Checklist bắt buộc

```
CLONE CHECKLIST — dự án: [Tên dự án mới]

Setup:
[ ] Fork / clone repo
[ ] Đổi "name" trong package.json
[ ] Đổi NEXT_PUBLIC_APP_NAME trong .env.local
[ ] Tạo .env.local từ .env.example
[ ] Điền JWT_SECRET (tối thiểu 32 ký tự, random)
[ ] Điền API_BASE_URL của backend mới
[ ] npm install

Style (thay đổi để khác base):
[ ] Đổi màu primary trong tailwind.config (hoặc CSS variables)
[ ] Đổi font nếu cần (layout.tsx)
[ ] Đổi tên app trong messages/vi.json + en.json
[ ] Thay logo/favicon trong public/

Content:
[ ] Xóa feature demo nếu có
[ ] Cập nhật README.md với tên dự án mới
[ ] Cập nhật CLAUDE.md với context dự án mới

Verify:
[ ] npm run build → không có lỗi
[ ] npm run lint → không có warning
[ ] Test login flow hoạt động
[ ] Test route protection hoạt động
[ ] Test i18n switch vi/en hoạt động
```

### Những gì KHÔNG thay đổi khi clone

```
Giữ nguyên kiến trúc:
✓ proxy.ts pattern (chỉ update PUBLIC_PATHS)
✓ (protected)/layout.tsx pattern
✓ src/features/ structure
✓ serverApi / clientApi pattern
✓ Zod schema validation pattern
✓ next-intl configuration
```

---

## [debug-protocol] — Debug Có Hệ Thống

**Dùng khi:** Build lỗi, test fail, hoặc behavior không đúng.

### 5 bước triage — THEO THỨ TỰ, không nhảy bước

```
Bước 1 — REPRODUCE
  Tái tạo lỗi nhất quán với minimum steps.
  Không làm bước 2 nếu chưa reproduce được.

Bước 2 — LOCALIZE
  Thu hẹp: server hay client? Route nào? Component nào?
  Check: `npm run build` output, browser console, server logs.

Bước 3 — REDUCE
  Tạo minimal case — xóa bớt code cho đến khi chỉ còn phần gây lỗi.

Bước 4 — FIX ROOT CAUSE
  Sửa nguyên nhân, không sửa triệu chứng.
  Nếu patch "ẩn" lỗi thay vì fix: DỪNG và báo cáo.

Bước 5 — GUARD
  Thêm test để lỗi không quay lại.
  Commit: "fix([scope]): [mô tả lỗi và cách fix]"
```

### TypeScript errors — Không dùng `any` để thoát

```ts
// ❌ Patch lỗi TS bằng any
const data: any = response

// ✅ Dùng type guard
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null && "id" in data
}

// ✅ Dùng unknown + assert
const data = response as unknown as User // chỉ khi chắc chắn về shape
```

### Next.js 16 specific errors

```
Lỗi "middleware not found" hoặc "middleware deprecated":
→ Dùng proxy.ts, không phải middleware.ts

Lỗi "use client" / "use server" conflict:
→ Server Component không được import Client Component trực tiếp vào server logic
→ Tách: page.tsx (Server) → component (Client)

Lỗi i18n "Missing message":
→ Kiểm tra key tồn tại ở CẢ vi.json và en.json
→ Kiểm tra namespace trong useTranslations() khớp với key

Lỗi auth redirect loop:
→ Kiểm tra PUBLIC_PATHS trong proxy.ts
→ Kiểm tra session cookie name trong env
```

### Stop-the-line rule

Nếu sau 2 lần thử vẫn không reproduce được lỗi → DỪNG, báo cáo context đầy đủ, hỏi thêm thông tin.

---

## [commit-protocol] — Commit & Version Control

**Dùng khi:** Sắp commit bất kỳ thay đổi nào.

### Pre-commit checklist (KHÔNG SKIP)

```
[ ] npm run lint    → 0 error, 0 warning
[ ] npm run build   → build thành công
[ ] Tests liên quan → pass
[ ] Không có file .env.local hoặc secret trong staged files
[ ] git diff --staged → review lại một lần cuối
```

**Script tự động:** `bash agent-skill/scripts/pre-commit-check.sh`
Chạy lint + build + secret scan + i18n check, output JSON.

> `npm run build` và README sync check được enforce bởi Husky **pre-push** hook.
> Nếu system files thay đổi mà README.md chưa cập nhật, push sẽ bị block.
> Bypass (chỉ khi biết chắc không cần update docs): `git push --no-verify`

### Commit message format

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

### Branch naming

```
feature/[feature-name]     → tính năng mới
fix/[bug-description]      → bug fix
refactor/[what]            → refactor
chore/[task]               → maintenance
```

---

## [review-gates] — Quality Gates Trước Khi Merge

**Dùng khi:** Chuẩn bị merge vào main.

### Gate 1 — Build & Lint

```bash
npm run build   # Phải pass — không có TS error, không có build error
npm run lint    # Phải pass — 0 error
```

### Gate 2 — Kiến trúc

```
[ ] Feature code nằm trong src/features/[name]/ — không scattered
[ ] Page component chỉ là shell mỏng, không có business logic
[ ] Không có import vòng tròn
[ ] Không có relative path dài (../../..) — dùng @/ alias
[ ] Không có unused import
```

### Gate 3 — Convention

```
[ ] Không có string hardcode — tất cả qua next-intl
[ ] Không có any trong TypeScript
[ ] Named exports (không default export với component)
[ ] File đặt tên đúng: kebab-case.tsx
[ ] Zod schema validate mọi external input
```

### Gate 4 — Security

```
[ ] Không commit secret hoặc .env.local
[ ] User input được validate bằng Zod trước khi xử lý
[ ] API calls đi qua serverApi/clientApi — không fetch trực tiếp
[ ] Route mới cần auth đã được thêm vào (protected)/ group
[ ] Route mới public đã được thêm vào PUBLIC_PATHS
```

### Gate 5 — i18n

```
[ ] Mọi string mới đã có trong vi.json VÀ en.json
[ ] Không có key thiếu ở một ngôn ngữ
[ ] Namespace trong useTranslations() khớp với key trong JSON
```

---

## Red Flags — Dấu Hiệu Cần Dừng Lại

Gặp những dấu hiệu này → dừng, báo cáo, hỏi trước khi tiếp tục:

- ⚠️ Đang thêm dependency mới không có trong package.json gốc
- ⚠️ Đang thay đổi proxy.ts hoặc auth flow
- ⚠️ Build lỗi TypeScript không rõ nguyên nhân
- ⚠️ Muốn dùng `any` vì không biết type đúng
- ⚠️ String hiển thị không có trong messages/*.json
- ⚠️ Đang tạo file ngoài cấu trúc đã định
- ⚠️ Có route mới chưa biết protected hay public
- ⚠️ Đang copy code logic vào page.tsx thay vì features/

---

## Verification Checklist Cuối Cùng

Trước khi kết thúc bất kỳ task nào:

```
[ ] npm run build → thành công
[ ] npm run lint  → 0 lỗi
[ ] Feature hoạt động đúng theo acceptance criteria
[ ] i18n hoạt động ở cả /vi và /en
[ ] Auth: route protected chặn đúng, route public không bị chặn
[ ] Không có console.error trong browser
[ ] Đã commit với message đúng format
```
