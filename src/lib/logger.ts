// Minimal structured logger — no external service wired up yet (Sentry/pino/etc.
// would be a bigger, separate decision), but every entry is a single JSON line
// so a real log pipeline can start ingesting these without changing call sites.
type LogLevel = "info" | "warn" | "error"

function serializeError(err: unknown): unknown {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack }
  }
  return err
}

function write(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
  }
  const line = JSON.stringify(entry)
  if (level === "error") console.error(line)
  else if (level === "warn") console.warn(line)
  else console.log(line)
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => write("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => write("warn", message, context),
  error: (message: string, error?: unknown) =>
    write("error", message, error !== undefined ? { error: serializeError(error) } : undefined),
}
