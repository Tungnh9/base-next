#!/bin/bash
# scaffold-feature.sh
# Tạo cấu trúc thư mục và file boilerplate cho feature mới
# Usage: bash agent-skill/scripts/scaffold-feature.sh <feature-name> [locale]
#
# Ví dụ: bash agent-skill/scripts/scaffold-feature.sh product
#
# Output: JSON với danh sách files đã tạo

set -e

FEATURE_NAME="${1:-}"
LOCALE="${2:-vi}"

if [ -z "$FEATURE_NAME" ]; then
  echo '{"status":"error","message":"Thiếu tên feature. Usage: bash agent-skill/scripts/scaffold-feature.sh <feature-name>"}' >&1
  exit 1
fi

# Chuyển thành PascalCase
FEATURE_PASCAL=$(echo "$FEATURE_NAME" | sed -r 's/(^|-)([a-z])/\U\2/g')

FEATURE_DIR="src/features/$FEATURE_NAME"
ROUTE_DIR="src/app/\[locale\]/(protected)/$FEATURE_NAME"

echo "Scaffolding feature: $FEATURE_NAME ($FEATURE_PASCAL)..." >&2

CREATED_FILES=()

# ─── Check: feature đã tồn tại chưa? ─────────────────────────────────────────
if [ -d "$FEATURE_DIR" ]; then
  echo "{\"status\":\"error\",\"message\":\"Feature '$FEATURE_NAME' đã tồn tại tại $FEATURE_DIR\"}"
  exit 1
fi

# ─── Tạo thư mục ──────────────────────────────────────────────────────────────
mkdir -p "$FEATURE_DIR/hooks"
mkdir -p "$FEATURE_DIR/components"
echo "  Created directories" >&2

# ─── types.ts ─────────────────────────────────────────────────────────────────
cat > "$FEATURE_DIR/types.ts" << EOF
export interface ${FEATURE_PASCAL} {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ${FEATURE_PASCAL}ListResponse {
  items: ${FEATURE_PASCAL}[];
  total: number;
  page: number;
  pageSize: number;
}
EOF
CREATED_FILES+=("$FEATURE_DIR/types.ts")
echo "  Created types.ts" >&2

# ─── schemas.ts ───────────────────────────────────────────────────────────────
cat > "$FEATURE_DIR/schemas.ts" << EOF
import { z } from "zod";

export const ${FEATURE_PASCAL}Schema = z.object({
  // TODO: Thêm fields và validation messages
  name: z.string().min(1, "Không được để trống").max(100, "Tối đa 100 ký tự"),
});

export type ${FEATURE_PASCAL}Input = z.infer<typeof ${FEATURE_PASCAL}Schema>;
EOF
CREATED_FILES+=("$FEATURE_DIR/schemas.ts")
echo "  Created schemas.ts" >&2

# ─── api.ts ───────────────────────────────────────────────────────────────────
cat > "$FEATURE_DIR/api.ts" << EOF
import { clientApi } from "@/lib/api";
import type { ${FEATURE_PASCAL}, ${FEATURE_PASCAL}ListResponse } from "./types";

export async function get${FEATURE_PASCAL}List(page = 1, pageSize = 20) {
  return clientApi<${FEATURE_PASCAL}ListResponse>(
    "/${FEATURE_NAME}?page=\${page}&pageSize=\${pageSize}"
  );
}

export async function get${FEATURE_PASCAL}ById(id: string) {
  return clientApi<${FEATURE_PASCAL}>("/${FEATURE_NAME}/\${id}");
}
EOF
CREATED_FILES+=("$FEATURE_DIR/api.ts")
echo "  Created api.ts" >&2

# ─── actions.ts ───────────────────────────────────────────────────────────────
cat > "$FEATURE_DIR/actions.ts" << EOF
"use server";

import { serverApi } from "@/lib/api";
import { ${FEATURE_PASCAL}Schema } from "./schemas";
import type { ${FEATURE_PASCAL} } from "./types";

export async function create${FEATURE_PASCAL}(input: unknown) {
  const parsed = ${FEATURE_PASCAL}Schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  const { data, error } = await serverApi<${FEATURE_PASCAL}>("/${FEATURE_NAME}", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (error) return { error };
  return { data };
}
EOF
CREATED_FILES+=("$FEATURE_DIR/actions.ts")
echo "  Created actions.ts" >&2

# ─── components/${feature-name}-list.tsx ──────────────────────────────────────
cat > "$FEATURE_DIR/components/${FEATURE_NAME}-list.tsx" << EOF
import { useTranslations } from "next-intl";
import { get${FEATURE_PASCAL}List } from "../api";

export async function ${FEATURE_PASCAL}List() {
  const t = useTranslations("${FEATURE_PASCAL}");
  const { data, error } = await get${FEATURE_PASCAL}List();

  if (error) {
    return <p className="text-destructive">{t("error.loadFailed")}</p>;
  }

  if (!data?.items.length) {
    return <p className="text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <ul className="grid gap-4">
        {data.items.map((item) => (
          <li key={item.id} className="rounded-lg border p-4">
            {/* TODO: Render item fields */}
            <p>{item.id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
EOF
CREATED_FILES+=("$FEATURE_DIR/components/${FEATURE_NAME}-list.tsx")
echo "  Created components/${FEATURE_NAME}-list.tsx" >&2

# ─── Route page ───────────────────────────────────────────────────────────────
mkdir -p "$ROUTE_DIR"
cat > "$ROUTE_DIR/page.tsx" << EOF
import { ${FEATURE_PASCAL}List } from "@/features/${FEATURE_NAME}/components/${FEATURE_NAME}-list";

export default function ${FEATURE_PASCAL}Page() {
  return (
    <main className="container py-8">
      <${FEATURE_PASCAL}List />
    </main>
  );
}
EOF
CREATED_FILES+=("$ROUTE_DIR/page.tsx")
echo "  Created route page.tsx" >&2

# ─── i18n keys reminder ───────────────────────────────────────────────────────
echo "" >&2
echo "  ⚠ Nhớ thêm i18n keys vào messages/vi.json và messages/en.json:" >&2
echo '  "'$FEATURE_PASCAL'": {' >&2
echo '    "title": "...", "empty": "...", "error": { "loadFailed": "..." }' >&2
echo '  }' >&2

# ─── Output JSON ──────────────────────────────────────────────────────────────
FILES_JSON=$(printf '%s\n' "${CREATED_FILES[@]}" | python3 -c "import json,sys; print(json.dumps([l.rstrip() for l in sys.stdin]))" 2>/dev/null || echo "[]")

python3 -c "
import json
print(json.dumps({
    'status': 'success',
    'feature': '$FEATURE_NAME',
    'pascal': '$FEATURE_PASCAL',
    'created_files': $FILES_JSON,
    'next_steps': [
        'Cập nhật $FEATURE_DIR/types.ts với đúng fields',
        'Cập nhật $FEATURE_DIR/schemas.ts với validation rules',
        'Thêm i18n keys vào messages/vi.json và messages/en.json',
        'Implement components/${FEATURE_NAME}-list.tsx',
        'Commit: feat($FEATURE_NAME): add types and Zod schemas'
    ]
}, ensure_ascii=False, indent=2))
"
