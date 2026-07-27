---
name: feature-workflow
description: Quy trình bắt buộc khi thêm feature, page, hoặc module mới vào dự án base-next — viết spec trước khi code, tạo cấu trúc thư mục src/features/[name]/ chuẩn, và implement theo vertical slices với commit checkpoint sau mỗi bước. Dùng khi user yêu cầu "thêm feature X", "thêm page mới", hoặc "tạo module mới". Không bao gồm chi tiết viết component (xem component-convention), gọi API (xem api-convention), hay thêm chuỗi i18n (xem i18n-workflow).
---

# Thêm Feature Mới

**Dùng khi:** Thêm tính năng, page, hoặc module mới.

## Phase 1: Specify (KHÔNG BỎ QUA)

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

## Phase 2: Tạo cấu trúc thư mục

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

## Phase 3: Implement theo vertical slices

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
