"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: ROUTES.dashboard },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUiStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-60 shrink-0 border-r bg-sidebar">
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
