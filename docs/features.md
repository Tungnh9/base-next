# Thêm tính năng mới

Mọi feature đều theo pattern **feature-sliced**: tất cả code của một tính năng nằm trong `src/features/[tên]/`.

## Cấu trúc thư mục

```
src/features/[feature-name]/
├── types.ts        # TypeScript types + interfaces
├── schemas.ts      # Zod validation schemas
├── actions.ts      # Server Actions (mutations — "use server")
├── api.ts          # REST calls (queries) — switch mock/real
├── mock-data.ts    # Fixture data (tuỳ chọn, khi chưa có backend)
├── services.ts     # Business logic (tuỳ chọn)
├── hooks/
│   └── use-[name].ts   # Client hooks của feature
└── components/
    ├── [name]-list.tsx
    ├── [name]-form.tsx
    └── [name]-card.tsx
```

## Route page — shell mỏng

Page component chỉ import và render component từ `features/`, không chứa business logic:

```tsx
// src/app/[locale]/(protected)/products/page.tsx
import { ProductList } from "@/features/product/components/product-list"

export default function ProductsPage() {
  return <ProductList />
}
```

## Scaffold tự động

```bash
bash agent-skill/scripts/scaffold-feature.sh <feature-name>
```

Tạo đủ `types.ts`, `schemas.ts`, `api.ts`, `actions.ts`, `components/`, route `page.tsx`.

## Vertical slices

Implement theo từng slice nhỏ, mỗi slice là một commit độc lập:

```
Slice 1: types.ts + schemas.ts
  → Commit: "feat([name]): add types and zod schemas"

Slice 2: api.ts + mock-data.ts
  → Commit: "feat([name]): add API client and mock data"

Slice 3: actions.ts
  → Commit: "feat([name]): add server actions"

Slice 4: components/
  → Commit: "feat([name]): add UI components"

Slice 5: page.tsx + messages/vi.json + messages/en.json
  → Commit: "feat([name]): add route and i18n strings"
```

## Checklist trước khi merge

- [ ] Feature code nằm trong `src/features/[name]/` — không scattered
- [ ] Page component chỉ là shell mỏng, không có business logic
- [ ] Không có string hardcode — tất cả qua next-intl
- [ ] Mọi string mới có trong cả `vi.json` và `en.json`
- [ ] Route mới cần auth nằm trong `(protected)/`
- [ ] Route mới public đã thêm vào `PUBLIC_PATHS` trong `proxy.ts`
- [ ] `npm run build && npm run lint` pass
