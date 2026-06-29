import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Tất cả locale đều có prefix: /vi/..., /en/...
  localePrefix: "always",
});
