import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-xl font-semibold">Trang không tồn tại</p>
      <Button asChild>
        <Link href={ROUTES.home}>Về trang chủ</Link>
      </Button>
    </div>
  );
}
