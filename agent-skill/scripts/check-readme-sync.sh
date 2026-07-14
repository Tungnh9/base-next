#!/bin/bash
# check-readme-sync.sh
# Blocks push if system/architecture files changed without README.md update.

SYSTEM_FILES=(
  "package.json"
  "next.config.ts"
  "proxy.ts"
  "src/i18n/config.ts"
  ".env.example"
  "src/app/globals.css"
)

# Get files changed between upstream and HEAD; fallback to HEAD~1 if no upstream
UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
if [ -n "$UPSTREAM" ]; then
  CHANGED=$(git diff --name-only "$UPSTREAM"...HEAD 2>/dev/null)
else
  CHANGED=$(git diff --name-only HEAD~1 2>/dev/null)
fi

[ -z "$CHANGED" ] && exit 0

SYSTEM_CHANGED=""
for file in "${SYSTEM_FILES[@]}"; do
  if echo "$CHANGED" | grep -qF "$file"; then
    SYSTEM_CHANGED="$SYSTEM_CHANGED\n  - $file"
  fi
done

if [ -n "$SYSTEM_CHANGED" ]; then
  if ! echo "$CHANGED" | grep -qF "README.md"; then
    echo ""
    echo "❌  System files changed but README.md was not updated."
    printf "    Changed:%s\n" "$SYSTEM_CHANGED"
    echo ""
    echo "    Update README.md to reflect the changes, then push again."
    echo "    (bypass: git push --no-verify)"
    echo ""
    exit 1
  fi
fi

exit 0
