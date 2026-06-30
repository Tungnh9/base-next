import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export async function Header() {
  const t = await getTranslations("nav");
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href={ROUTES.home} className="font-semibold">
          App
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit">
                {t("dashboard")}
              </Button>
            </form>
          ) : (
            <Button asChild size="sm">
              <Link href={ROUTES.login}>Đăng nhập</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
