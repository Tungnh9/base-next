---
name: api-convention
description: Convention gọi API trong base-next — cách viết Server Action dùng serverApi (server-side) và client fetching dùng clientApi (client-side), pattern destructure { data, error } chuẩn. Dùng khi user cần "fetch data", "gọi API", "viết Server Action", hoặc "tạo mutation". Không bao gồm validate schema cho auth (xem auth-convention) hay cấu trúc file api.ts/actions.ts tổng thể của feature (xem feature-workflow).
---

# Gọi API

**Dùng khi:** Cần fetch data hoặc mutation.

## Server-side (Server Component, Server Action, Route Handler)

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

## Client-side (Client Component)

```ts
// src/features/[feature]/api.ts
import { clientApi } from "@/lib/api";
import type { [FeatureType] } from "./types";

export async function get[Feature]List() {
  // clientApi — cần truyền token tường minh nếu cần
  return clientApi<[FeatureType][]>("/[endpoint]");
}
```

## Pattern ApiResponse

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
