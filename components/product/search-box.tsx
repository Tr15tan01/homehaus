"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(value)}`);
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="w-full rounded-full border border-stone bg-surface px-5 py-3 text-sm outline-none focus:border-moss"
      />
    </form>
  );
}
