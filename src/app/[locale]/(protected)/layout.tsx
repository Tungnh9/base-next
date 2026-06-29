import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect(ROUTES.login);
  }

  return <>{children}</>;
}
