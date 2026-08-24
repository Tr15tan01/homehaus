"use client";

import { useTheme } from "next-themes";
import { useIsClient } from "@/lib/use-is-client";

export default function ThemeToggle({
  labels,
}: {
  labels: { light: string; dark: string };
}) {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid rendering a theme-dependent icon until mounted, so the server-
  // rendered markup (which doesn't know the user's OS preference) matches
  // the client on first paint — next-themes' recommended pattern.
  const mounted = useIsClient();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? labels.light : labels.dark}
      className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-surface hover:text-ink"
    >
      {mounted && (
        <>
          {isDark ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </>
      )}
    </button>
  );
}
