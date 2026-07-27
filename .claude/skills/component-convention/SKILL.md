---
name: component-convention
description: Convention viết React component trong base-next — named export, template chuẩn dùng next-intl/cn/shadcn, bảng quy tắc Đúng/Sai cho string/className/icon/state/type. Dùng khi user yêu cầu "tạo component UI", "viết component cho feature X", hoặc cần biết dùng shadcn/ui component có sẵn trước khi tạo mới. Không bao gồm cấu trúc thư mục feature tổng thể (xem feature-workflow) hay cách gọi API trong component (xem api-convention).
---

# Viết Component

**Dùng khi:** Tạo React component bất kỳ.

## Template chuẩn

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

## Rules

| Rule         | Đúng                               | Sai                      |
| ------------ | ---------------------------------- | ------------------------ |
| Export       | Named export                       | Default export           |
| String       | `t("key")`                         | `"Tiêu đề"` hardcode     |
| ClassName    | `cn("a", condition && "b")`        | String concatenation     |
| Icon         | `import { X } from "lucide-react"` | Emoji hoặc SVG inline    |
| State global | Zustand store                      | useState xuyên component |
| Type         | Explicit interface                 | `any` hoặc `object`      |

## shadcn/ui Component

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
