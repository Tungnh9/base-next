# API Layer

## Gọi API

### Server-side (Server Action / Route Handler)

```ts
// Tự lấy session cookie, extract accessToken, gửi Bearer header
const { data, error } = await serverApi<User>("/users/me")
```

### Client-side (Client Component)

```ts
const { data, error } = await clientApi<Product[]>("/products")
```

### ApiResponse shape

`ApiResponse<T>` là discriminated union — luôn destructure và handle error trước:

```ts
type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string; status: number } }

const { data, error } = await serverApi<Result>("/endpoint")
if (error) return { error: error.message }
// dùng data — đã type-safe
```

### BaseApiService

Dùng khi muốn tổ chức feature service theo class:

```ts
import { BaseApiService, serverHttpClient } from "@/lib/api"

class ProductService extends BaseApiService {
  constructor() {
    super(serverHttpClient, "/products")
  }
  list() {
    return this.get<Product[]>()
  }
  create(data: ProductInput) {
    return this.post<Product>("", data)
  }
}
```

---

## Mock API

Khi backend chưa sẵn sàng, mỗi feature thêm `mock-data.ts` cạnh `api.ts` — cùng chữ ký hàm, trả fixture data qua `mockApi()` / `mockApiError()` từ `src/lib/mock.ts`.

### Pattern

```ts
// features/[name]/api.ts
import { USE_MOCK_API } from "@/lib/mock"
import { xMockApi } from "./mock-data"

const xRealApi = { list: () => serverApi<X[]>("/x") }

export const xApi = USE_MOCK_API ? xMockApi : xRealApi
```

Bật/tắt qua `NEXT_PUBLIC_USE_MOCK_API` trong `.env.local`. Khi có backend thật, đổi về `false` — không cần sửa `actions.ts`, hook, hay component nào.

Xem `src/features/auth/mock-data.ts` làm ví dụ đầy đủ.

---

## Server Actions

```ts
"use server"
export async function myAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = mySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { data, error } = await serverApi<Result>("/endpoint", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  })
  if (error) return { error: error.message }

  redirect(ROUTES.somewhere)
}
```

Dùng hook `useActionState` (React 19) để kết nối với form — xem pattern tại `src/features/auth/hooks/use-auth.ts`.
