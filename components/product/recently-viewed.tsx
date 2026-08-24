"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

const STORAGE_KEY = "homehaus_recently_viewed";
const MAX_ITEMS = 8;

export type RecentlyViewedEntry = {
  slug: string;
  name: string;
  price: number;
  image: string | undefined;
};

// Purely a client-side convenience — stored in the browser's localStorage,
// never sent to the server. Clearing browser data clears this too.
export function trackRecentlyViewed(entry: RecentlyViewedEntry) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: RecentlyViewedEntry[] = raw ? JSON.parse(raw) : [];
    const deduped = existing.filter((item) => item.slug !== entry.slug);
    const updated = [entry, ...deduped].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage can throw in private browsing / disabled-storage modes —
    // recently-viewed is a nice-to-have, so fail silently.
  }
}

let cachedRaw: string | null = null;
const EMPTY: RecentlyViewedEntry[] = [];
let cachedItems: RecentlyViewedEntry[] = EMPTY;

function readStoredItems(): RecentlyViewedEntry[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  // Only re-parse (and only return a new array reference) when the
  // underlying string has actually changed — useSyncExternalStore requires
  // getSnapshot to return a stable reference across calls when nothing
  // changed, or it re-renders forever treating every call as "new" data.
  if (raw === cachedRaw) return cachedItems;

  cachedRaw = raw;
  try {
    cachedItems = raw ? JSON.parse(raw) : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
}

// useSyncExternalStore instead of useEffect+useState: localStorage is an
// external system, and this is the store-subscription pattern React
// recommends for reading it without an extra render pass. Listening to the
// "storage" event also means this strip stays in sync if the person has the
// site open in two tabs.
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function RecentlyViewedStrip({ heading }: { heading: string }) {
  const items = useSyncExternalStore(subscribe, readStoredItems, () => EMPTY);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="mb-6 font-display text-2xl">{heading}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/products/${item.slug}`}
            className="group w-36 shrink-0"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="144px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <p className="mt-2 truncate text-xs text-ink">{item.name}</p>
            <p className="text-xs text-ink-soft">{formatPrice(item.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
