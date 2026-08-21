"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export default function SubmitButton({
  children,
  className,
  pendingText,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-moss px-6 py-3 text-sm font-medium text-white transition hover:bg-moss-dark disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {pending ? pendingText ?? "Please wait…" : children}
    </button>
  );
}
