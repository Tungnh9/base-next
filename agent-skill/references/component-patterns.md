# Component Patterns Reference

Tài liệu tham chiếu nhanh cho các pattern component phổ biến trong base-next.
Skill chính load file này khi cần ví dụ cụ thể.

---

## Server Component vs Client Component

```tsx
// SERVER COMPONENT (mặc định — không có "use client")
// ✅ Có thể: fetch data, đọc cookies, access DB
// ❌ Không thể: useState, useEffect, event handlers

// src/features/product/components/product-list.tsx
import { getProductList } from "../api";

export async function ProductList() {
  const { data: products, error } = await getProductList();

  if (error) return <ErrorMessage />;
  return (
    <ul>
      {products?.map(p => <ProductCard key={p.id} product={p} />)}
    </ul>
  );
}
```

```tsx
// CLIENT COMPONENT ("use client" ở đầu file)
// ✅ Có thể: useState, useEffect, event handlers, browser APIs
// ❌ Không thể: fetch trực tiếp với credentials server-side

"use client";

// src/features/product/components/product-form.tsx
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema } from "../schemas";
import type { ProductInput } from "../types";

export function ProductForm() {
  const t = useTranslations("Product");
  const form = useForm<ProductInput>({
    resolver: zodResolver(ProductSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  );
}
```

---

## Zustand Store Pattern

```ts
// src/stores/[name]-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface [Name]State {
  // State
  value: string;
  isLoading: boolean;
  
  // Actions
  setValue: (value: string) => void;
  reset: () => void;
}

const initialState = {
  value: "",
  isLoading: false,
};

export const use[Name]Store = create<[Name]State>()(
  persist(
    (set) => ({
      ...initialState,
      setValue: (value) => set({ value }),
      reset: () => set(initialState),
    }),
    {
      name: "[name]-storage", // localStorage key
      // Chỉ persist những field cần thiết
      partialize: (state) => ({ value: state.value }),
    }
  )
);
```

---

## Form với react-hook-form + Zod

```tsx
// src/features/[feature]/schemas.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
```

```tsx
// src/features/[feature]/components/login-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginSchema, type LoginInput } from "../schemas";
import { loginAction } from "../actions";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: LoginInput) {
    const result = await loginAction(data);
    if (result.error) {
      setError("root", { message: "Đăng nhập thất bại" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register("email")}
          type="email"
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
      </Button>
      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}
    </form>
  );
}
```

---

## Toast Notifications (Sonner)

```tsx
"use client";
import { toast } from "sonner";

// Success
toast.success("Tạo thành công!");

// Error
toast.error("Có lỗi xảy ra, thử lại sau.");

// Loading → Success pattern
const toastId = toast.loading("Đang xử lý...");
// ... sau khi xong
toast.success("Hoàn thành!", { id: toastId });
```

---

## Conditional Rendering Pattern

```tsx
// ✅ Dùng early return thay vì nested ternary phức tạp
export function ProductDetail({ id }: { id: string }) {
  const { data, isLoading, error } = useProduct(id);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data) return <EmptyState />;

  // Happy path — data guaranteed here
  return <div>{data.name}</div>;
}
```