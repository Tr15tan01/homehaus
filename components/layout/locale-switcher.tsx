"use client";

import { useTransition } from "react";
import { setLocaleAction } from "@/app/locale-actions";
import type { Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export default function LocaleSwitcher({ locale }: { locale: Locale }) {
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      setLocaleAction(next);
    });
  }

  return (
    <div
      className="flex items-center overflow-hidden rounded-full border border-stone text-xs"
      aria-label="Language"
    >
      <button
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        disabled={isPending}
        className={cn(
          "cursor-pointer px-2.5 py-1 transition disabled:cursor-default",
          locale === "en" ? "bg-moss text-white" : "text-ink-soft hover:text-ink",
        )}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("ka")}
        aria-pressed={locale === "ka"}
        disabled={isPending}
        className={cn(
          "cursor-pointer px-2.5 py-1 transition disabled:cursor-default",
          locale === "ka" ? "bg-moss text-white" : "text-ink-soft hover:text-ink",
        )}
      >
        ქარ
      </button>
    </div>
  );
}
