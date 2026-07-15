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

## Feature CRUD mẫu

`src/features/customers/` là feature CRUD đầy đủ — dùng làm tham khảo khi bắt đầu feature mới:

- **types.ts** — `Customer`, `CustomerStatus`, `CreateCustomerInput`, `UpdateCustomerInput`
- **schemas.ts** — `createCustomerSchema`, `updateCustomerSchema` (Zod) + `CreateCustomerFormValues`, `UpdateCustomerFormValues` types
- **mock-data.ts** — 5 fixture customers + `customerMockApi` (getAll, getById, create, update, delete)
- **api.ts** — `customerApi = USE_MOCK_API ? customerMockApi : customerRealApi`
- **actions.ts** — Server Actions với Zod validation, trả về `{ data, error }`
- **hooks/use-customers.ts** — tick-based refresh pattern (thoả mãn `react-hooks/set-state-in-effect`)
- **components/customer-list.tsx** — table với search, skeleton, edit/delete
- **components/customer-form.tsx** — dialog tạo/sửa với RHF + zodResolver

## Route page — shell mỏng

Page component chỉ import và render component từ `features/`, không chứa business logic:

```tsx
// src/app/[locale]/(protected)/products/page.tsx
import { ProductList } from "@/features/product/components/product-list"

export default function ProductsPage() {
  return <ProductList />
}
```

## Page metadata động

Mọi page trong `(protected)/` và `(auth)/` phải có `generateMetadata()`. Dùng namespace `"metadata"` trong `messages/vi.json` và `messages/en.json`:

```tsx
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })
  return { title: `${t("customers")} — ${t("siteName")}` }
}
```

Format chuẩn: `"<Tên trang> — Vuexy"` (em dash, không phải hyphen). Thêm key mới vào namespace `"metadata"` khi tạo page mới.

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
