import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Base NextJS",
    default: "Base NextJS",
  },
  description: "Base NextJS template",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
