"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Lỗi nghiêm trọng</h2>
          <button
            onClick={reset}
            className="px-4 py-2 bg-black text-white rounded-md text-sm"
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
