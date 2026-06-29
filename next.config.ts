import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Validate env at build time — throws if required vars are missing
import "./src/lib/env";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
