# Security Checklist — base-next

Load file này khi làm việc liên quan đến auth, user input, hoặc data storage.

---

## Pre-commit Security Check

```
[ ] Không có secret / API key trong code
[ ] Không có .env.local trong staged files (check: git status)
[ ] Không có console.log chứa sensitive data
[ ] JWT_SECRET trong .env.local ≥ 32 ký tự
```

---

## Input Validation (Zod — Bắt buộc)

```ts
// Mọi data từ user/external API phải qua Zod trước khi dùng

// ❌ SAI — dùng trực tiếp không validate
export async function createUser(data: unknown) {
  await db.save(data); // NGUY HIỂM
}

// ✅ ĐÚNG — validate bằng Zod
export async function createUser(data: unknown) {
  const parsed = UserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }
  await db.save(parsed.data); // Type-safe và validated
}
```

---

## Auth Security Rules

```
Cookie: httpOnly=true, secure=true, sameSite="lax"
JWT: 
  - Không lưu password, full PII, hoặc payment data trong payload
  - Set explicit expiry (vd: "1h", "7d")
  - Verify signature mỗi request — không trust client

Session:
  - Đọc session qua getSession() helper — không tự parse cookie
  - Invalidate token khi logout (blacklist hoặc short expiry)
```

---

## API Security

```ts
// ✅ Server Action — validate input và kiểm tra auth
"use server";

export async function sensitiveAction(input: unknown) {
  // 1. Auth check trước
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // 2. Validate input
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  // 3. Authorization (có quyền không?)
  if (!canPerformAction(session.user, parsed.data)) {
    throw new Error("Forbidden");
  }

  // 4. Execute
  return await performAction(parsed.data);
}
```

---

## Environment Variables

```
BẮT BUỘC trong .env.local (không được commit):
- JWT_SECRET         → ≥ 32 ký tự random
- API_BASE_URL       → URL backend (server-side only)

PUBLIC (có thể commit nếu không sensitive):
- NEXT_PUBLIC_APP_URL    → URL app
- NEXT_PUBLIC_APP_NAME   → Tên app

KHÔNG được đặt prefix NEXT_PUBLIC_ cho:
- JWT_SECRET
- Database credentials
- API keys bí mật
```