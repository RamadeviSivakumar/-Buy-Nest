"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Landing page failed:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fffdf9] px-6 text-center">
      <h1 className="text-4xl font-black text-[#25382b]">Couldn&apos;t load our products.</h1>
      <p className="mt-4 max-w-md leading-7 text-[#6e786c]">
        We had trouble connecting to the product service. Please try again.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#25382b] px-6 py-3 font-bold text-white hover:bg-[#cc704b]"
      >
        <RefreshCw size={18} /> Try again
      </button>
    </main>
  );
}
