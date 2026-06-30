"use client";

import { useEffect } from "react";
import "@/app/globals.css";
import { inter } from "@/lib/fonts";
import { Button } from "@/components/ui/button";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html className={`${inter.variable}`}>
      <body className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2>Lỗi nghiêm trọng</h2>
          <Button onClick={reset} className="bg-black text-white enabled:hover:brightness-90 enabled:active:brightness-[0.85]">
            Thử lại
          </Button>
        </div>
      </body>
    </html>
  );
}
