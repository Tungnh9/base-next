# Ví Dụ: Thêm Feature "Product" Từ Đầu

Đây là ví dụ end-to-end cho việc thêm một feature mới theo đúng workflow.
Dùng làm template cho mọi feature khác.

---

## 1. Spec (Phase 1)

```markdown
## Feature: Product Management

### Objective
Cho phép admin xem danh sách và thêm sản phẩm mới.
User thường chỉ xem, không tạo được.

### Scope — Lần này làm:
- Xem danh sách sản phẩm (có phân trang)
- Tạo sản phẩm mới (admin only)

### Scope — Lần sau:
- Edit / Delete sản phẩm
- Filter, search

### Files sẽ tạo:
- src/features/product/types.ts
- src/features/product/schemas.ts
- src/features/product/api.ts
- src/features/product/actions.ts
- src/features/product/components/product-list.tsx
- src/features/product/components/product-form.tsx
- src/app/[locale]/(protected)/products/page.tsx
- messages/vi.json (thêm namespace Product)
- messages/en.json (thêm namespace Product)

### Acceptance Criteria:
- [ ] /vi/products hiển thị danh sách từ API
- [ ] Admin thấy nút "Tạo mới", user thường không thấy
- [ ] Form tạo mới validate bằng Zod trước khi submit
- [ ] Có loading state khi fetch
- [ ] Có error state khi API lỗi
- [ ] Text hiển thị qua next-intl (không hardcode)
```

---

## 2. Types (Slice 1)

```ts
// src/features/product/types.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  createdAt: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}
```

```ts
// src/features/product/schemas.ts
import { z } from "zod";

export const ProductSchema = z.object({
  name: z
    .string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(100, "Tên tối đa 100 ký tự"),
  description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
  price: z
    .number({ invalid_type_error: "Giá phải là số" })
    .positive("Giá phải lớn hơn 0"),
});

export type ProductInput = z.infer<typeof ProductSchema>;
```

---

## 3. API Layer (Slice 2)

```ts
// src/features/product/api.ts
import { clientApi } from "@/lib/api";
import type { Product, ProductListResponse } from "./types";

export async function getProductList(page = 1, pageSize = 20) {
  return clientApi<ProductListResponse>(
    `/products?page=${page}&pageSize=${pageSize}`
  );
}

export async function getProductById(id: string) {
  return clientApi<Product>(`/products/${id}`);
}
```

```ts
// src/features/product/actions.ts
"use server";

import { serverApi } from "@/lib/api";
import { ProductSchema } from "./schemas";
import type { Product } from "./types";

export async function createProduct(formData: unknown) {
  const parsed = ProductSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const { data, error } = await serverApi<Product>("/products", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (error) return { error };
  return { data };
}
```

---

## 4. Components (Slice 3)

```tsx
// src/features/product/components/product-list.tsx
import { useTranslations } from "next-intl";
import { getProductList } from "../api";

export async function ProductList() {
  const t = useTranslations("Product");
  const { data, error } = await getProductList();

  if (error) {
    return <p className="text-destructive">{t("error.loadFailed")}</p>;
  }

  if (!data?.items.length) {
    return <p className="text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((product) => (
          <li key={product.id} className="rounded-lg border p-4">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-muted-foreground">
              {product.price.toLocaleString("vi-VN")}đ
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 5. i18n Strings (Slice 4)

```json
// messages/vi.json — thêm namespace Product
{
  "Product": {
    "title": "Danh sách sản phẩm",
    "empty": "Chưa có sản phẩm nào",
    "error": {
      "loadFailed": "Không tải được danh sách sản phẩm"
    },
    "actions": {
      "create": "Tạo sản phẩm mới"
    },
    "form": {
      "name": "Tên sản phẩm",
      "description": "Mô tả",
      "price": "Giá"
    }
  }
}
```

```json
// messages/en.json
{
  "Product": {
    "title": "Product List",
    "empty": "No products yet",
    "error": {
      "loadFailed": "Failed to load product list"
    },
    "actions": {
      "create": "Create Product"
    },
    "form": {
      "name": "Product Name",
      "description": "Description",
      "price": "Price"
    }
  }
}
```

---

## 6. Route Page (Slice 5)

```tsx
// src/app/[locale]/(protected)/products/page.tsx
import { ProductList } from "@/features/product/components/product-list";

export default function ProductsPage() {
  return (
    <main className="container py-8">
      <ProductList />
    </main>
  );
}
```

---

## 7. Commit Log (Đúng theo protocol)

```
feat(product): add Product types and Zod schemas
feat(product): add API client and server actions
feat(product): add ProductList server component
feat(product): add i18n strings (vi + en)
feat(product): add /products route page
```