#!/bin/bash
# check-i18n.sh
# Kiểm tra tất cả i18n keys có đồng bộ giữa vi.json và en.json không
# Usage: bash agent-skill/scripts/check-i18n.sh
#
# Output: JSON với danh sách keys thiếu ở mỗi ngôn ngữ

set -e

echo "Checking i18n key completeness..." >&2

if [ ! -f "messages/vi.json" ] || [ ! -f "messages/en.json" ]; then
  echo '{"status":"error","message":"Không tìm thấy messages/vi.json hoặc messages/en.json"}'
  exit 1
fi

python3 << 'PYEOF'
import json
import sys

def flatten_keys(d, prefix=""):
    keys = []
    for k, v in d.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.extend(flatten_keys(v, full_key))
        else:
            keys.append(full_key)
    return keys

with open("messages/vi.json", encoding="utf-8") as f:
    vi_data = json.load(f)

with open("messages/en.json", encoding="utf-8") as f:
    en_data = json.load(f)

vi_keys = set(flatten_keys(vi_data))
en_keys = set(flatten_keys(en_data))

missing_in_en = sorted(vi_keys - en_keys)
missing_in_vi = sorted(en_keys - vi_keys)

status = "pass" if not missing_in_en and not missing_in_vi else "fail"

result = {
    "status": status,
    "summary": {
        "vi_total": len(vi_keys),
        "en_total": len(en_keys),
        "missing_in_en": len(missing_in_en),
        "missing_in_vi": len(missing_in_vi),
    },
    "missing_in_en": missing_in_en,
    "missing_in_vi": missing_in_vi,
    "message": "Tất cả keys đồng bộ" if status == "pass" else f"Có {len(missing_in_en)} key thiếu trong en.json, {len(missing_in_vi)} key thiếu trong vi.json"
}

print(json.dumps(result, ensure_ascii=False, indent=2))
sys.exit(0 if status == "pass" else 1)
PYEOF
