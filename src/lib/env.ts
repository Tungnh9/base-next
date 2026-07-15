import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("My App"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  SESSION_COOKIE_NAME: z.string().default("session"),

  API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),

  // Serve fixture data instead of calling the real backend — for building
  // features before the backend exists. Flip to "false" once it's ready.
  NEXT_PUBLIC_USE_MOCK_API: z.coerce.boolean().default(false),

  // Site-wide maintenance mode — proxy.ts redirects all traffic to /maintenance
  // when true. Read directly from process.env in proxy.ts (edge runtime can't
  // reliably resolve the @/ alias); this schema entry documents/types it for
  // the rest of the app.
  // z.coerce.boolean() would treat the string "false" as truthy — match
  // proxy.ts's own `=== "true"` check instead.
  MAINTENANCE_MODE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors)
  throw new Error("Invalid environment configuration. See above for details.")
}

export const env = parsed.data

export type Env = z.infer<typeof envSchema>
