#!/bin/bash
# pre-commit-check.sh
# Chạy toàn bộ quality gates trước khi commit
# Usage: bash agent-skill/scripts/pre-commit-check.sh
#
# Output: JSON với status và danh sách lỗi (nếu có)
# Exit code: 0 = pass, 1 = fail

set -e

PASS=true
ERRORS=()
WARNINGS=()

echo "Running pre-commit checks..." >&2

# ─── Gate 1: Lint ─────────────────────────────────────────────────────────────
echo "  [1/4] Lint..." >&2
if npm run lint --silent 2>/dev/null; then
  echo "    ✓ Lint passed" >&2
else
  PASS=false
  ERRORS+=("Lint failed — chạy 'npm run lint' để xem chi tiết")
fi

# ─── Gate 2: Build ────────────────────────────────────────────────────────────
echo "  [2/4] Build..." >&2
if npm run build --silent 2>/dev/null; then
  echo "    ✓ Build passed" >&2
else
  PASS=false
  ERRORS+=("Build failed — chạy 'npm run build' để xem chi tiết")
fi

# ─── Gate 3: Secret scan ──────────────────────────────────────────────────────
echo "  [3/4] Secret scan..." >&2

# Kiểm tra .env.local không được staged
if git diff --cached --name-only 2>/dev/null | grep -q "\.env\.local"; then
  PASS=false
  ERRORS+=("NGUY HIỂM: .env.local đang được staged — xóa ngay bằng: git reset HEAD .env.local")
fi

# Kiểm tra pattern secret trong staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null | grep -E "\.(ts|tsx|js|jsx)$" || true)
if [ -n "$STAGED_FILES" ]; then
  if echo "$STAGED_FILES" | xargs grep -l "JWT_SECRET\s*=\s*['\"][^$]" 2>/dev/null | grep -q .; then
    PASS=false
    ERRORS+=("Có thể có JWT_SECRET hardcode trong source file")
  fi
  if echo "$STAGED_FILES" | xargs grep -l "password\s*=\s*['\"]" 2>/dev/null | grep -q .; then
    WARNINGS+=("Cảnh báo: Tìm thấy pattern 'password = ...' — kiểm tra không phải secret hardcode")
  fi
fi
echo "    ✓ Secret scan done" >&2

# ─── Gate 4: i18n completeness ────────────────────────────────────────────────
echo "  [4/4] i18n check..." >&2

VI_KEYS=""
EN_KEYS=""

if [ -f "messages/vi.json" ] && [ -f "messages/en.json" ]; then
  VI_KEYS=$(python3 -c "
import json, sys
def flatten(d, prefix=''):
    result = []
    for k, v in d.items():
        full_key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            result.extend(flatten(v, full_key))
        else:
            result.append(full_key)
    return result
with open('messages/vi.json') as f:
    data = json.load(f)
print('\n'.join(sorted(flatten(data))))
" 2>/dev/null || echo "")

  EN_KEYS=$(python3 -c "
import json, sys
def flatten(d, prefix=''):
    result = []
    for k, v in d.items():
        full_key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            result.extend(flatten(v, full_key))
        else:
            result.append(full_key)
    return result
with open('messages/en.json') as f:
    data = json.load(f)
print('\n'.join(sorted(flatten(data))))
" 2>/dev/null || echo "")

  # Keys có trong vi nhưng không có trong en
  MISSING_IN_EN=$(comm -23 <(echo "$VI_KEYS" | sort) <(echo "$EN_KEYS" | sort) 2>/dev/null || echo "")
  # Keys có trong en nhưng không có trong vi
  MISSING_IN_VI=$(comm -13 <(echo "$VI_KEYS" | sort) <(echo "$EN_KEYS" | sort) 2>/dev/null || echo "")

  if [ -n "$MISSING_IN_EN" ]; then
    WARNINGS+=("Keys có trong vi.json nhưng thiếu trong en.json: $MISSING_IN_EN")
  fi
  if [ -n "$MISSING_IN_VI" ]; then
    WARNINGS+=("Keys có trong en.json nhưng thiếu trong vi.json: $MISSING_IN_VI")
  fi
  echo "    ✓ i18n check done" >&2
else
  echo "    ⚠ messages/ không tìm thấy, bỏ qua i18n check" >&2
fi

# ─── Output JSON ──────────────────────────────────────────────────────────────
if [ "$PASS" = true ] && [ ${#WARNINGS[@]} -eq 0 ]; then
  STATUS="pass"
elif [ "$PASS" = true ]; then
  STATUS="pass_with_warnings"
else
  STATUS="fail"
fi

# Build JSON output
ERRORS_JSON=$(printf '%s\n' "${ERRORS[@]}" | python3 -c "import json,sys; print(json.dumps([l.rstrip() for l in sys.stdin]))" 2>/dev/null || echo "[]")
WARNINGS_JSON=$(printf '%s\n' "${WARNINGS[@]}" | python3 -c "import json,sys; print(json.dumps([l.rstrip() for l in sys.stdin if l.strip()]))" 2>/dev/null || echo "[]")

python3 -c "
import json
print(json.dumps({
    'status': '$STATUS',
    'errors': $ERRORS_JSON,
    'warnings': $WARNINGS_JSON,
    'message': 'All checks passed — safe to commit' if '$STATUS' == 'pass' else 'Fix errors before committing'
}, ensure_ascii=False, indent=2))
"

# Exit code
if [ "$PASS" = false ]; then
  exit 1
fi
exit 0
