# Template: Feature Mới

Copy-paste template này khi bắt đầu bất kỳ feature nào.
Thay [feature], [Feature], [FeatureName] bằng tên thực tế.

---

## File: src/features/[feature]/types.ts

```ts
export interface [FeatureName] {
  id: string;
  // Thêm fields
  createdAt: string;
  updatedAt: string;
}

export interface [FeatureName]ListResponse {
  items: [FeatureName][];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## File: src/features/[feature]/schemas.ts

```ts
import { z } from "zod";

export const [FeatureName]Schema = z.object({
  // Thêm fields với validation message tiếng Việt
  name: z.string().min(1, "Không được để trống").max(100, "Tối đa 100 ký tự"),
});

export type [FeatureName]Input = z.infer<typeof [FeatureName]Schema>;
```

---

## File: src/features/[feature]/api.ts

```ts
import { clientApi } from "@/lib/api";
import type { [FeatureName], [FeatureName]ListResponse } from "./types";

export async function get[FeatureName]List(page = 1) {
  return clientApi<[FeatureName]ListResponse>(`/[feature]?page=${page}`);
}

export async function get[FeatureName]ById(id: string) {
  return clientApi<[FeatureName]>(`/[feature]/${id}`);
}
```

---

## File: src/features/[feature]/actions.ts

```ts
"use server";

import { serverApi } from "@/lib/api";
import { [FeatureName]Schema } from "./schemas";
import type { [FeatureName] } from "./types";

export async function create[FeatureName](input: unknown) {
  const parsed = [FeatureName]Schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const { data, error } = await serverApi<[FeatureName]>("/[feature]", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (error) return { error };
  return { data };
}
```

---

## File: src/app/[locale]/(protected)/[feature]/page.tsx

```tsx
import { [FeatureName]List } from "@/features/[feature]/components/[feature]-list";

export default function [FeatureName]Page() {
  return (
    <main className="container py-8">
      <[FeatureName]List />
    </main>
  );
}
```

---

## i18n Keys để thêm vào vi.json + en.json

```
[FeatureName]:
  title: ""
  empty: ""
  error:
    loadFailed: ""
  actions:
    create: ""
    edit: ""
    delete: ""
  form:
    [field]: ""
```

---

## Commit Sequence

```
feat([feature]): add types and Zod schemas
feat([feature]): add API client and server actions  
feat([feature]): add UI components
feat([feature]): add i18n strings (vi + en)
feat([feature]): add route page
```
