"use client";

import { useRouter } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function SortSelect({
  value,
  baseHref,
}: {
  value: string;
  baseHref: string;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-soft">Sort</span>
      <select
        value={value}
        onChange={(e) => {
          const url = new URL(baseHref, "http://localhost");
          url.searchParams.set("sort", e.target.value);
          router.push(`${url.pathname}${url.search}`);
        }}
        className="rounded-lg border border-stone bg-surface px-3 py-1.5 text-sm"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
