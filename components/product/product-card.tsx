"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { formatPrice, cn } from "@/lib/utils";
import { toggleFavoriteAction } from "@/app/(shop)/actions";
import type { Product } from "@prisma/client";
import type { Locale } from "@/lib/locale-utils";
import { pick } from "@/lib/locale-utils";

export default function ProductCard({
  product,
  locale,
  isFavorited = false,
  isAuthenticated = false,
  smartBadgeLabel = "Smart",
}: {
  product: Product;
  locale: Locale;
  isFavorited?: boolean;
  isAuthenticated?: boolean;
  smartBadgeLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(isFavorited);
  const [, startTransition] = useTransition();

  const name = pick(locale, product.name, product.nameKa);

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const formData = new FormData();
    formData.set("productId", product.id);
    startTransition(() => {
      setOptimisticFavorited(!optimisticFavorited);
      toggleFavoriteAction(formData);
    });
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        )}

        <button
          onClick={handleFavorite}
          aria-label={optimisticFavorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={optimisticFavorited}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised/90 text-ink-soft backdrop-blur transition hover:text-clay"
        >
          <HeartIcon filled={optimisticFavorited} />
        </button>

        {product.group === "SMART_HOME" && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-surface-raised/90 px-2.5 py-1 text-[11px] font-medium text-ink-soft backdrop-blur">
            <span className="glow-dot" aria-hidden="true" />
            {smartBadgeLabel}
          </span>
        )}
        {product.compareAtPrice && (
          <span className="absolute bottom-3 left-3 rounded-full bg-clay px-2.5 py-1 text-[11px] font-medium text-white">
            −{Math.round((1 - product.basePrice / product.compareAtPrice) * 100)}%
          </span>
        )}
      </div>
      <div className="mt-3 space-y-0.5">
        <p className="text-sm text-ink">{name}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-soft">{formatPrice(product.basePrice)}</span>
          {product.compareAtPrice && (
            <span className="text-ink-soft/60 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      className={cn(filled && "text-clay")}
      aria-hidden="true"
    >
      <path
        d="M12 20.5s-7.5-4.6-9.8-9.2C.7 7.8 2.4 4.5 5.7 4c2-.3 3.9.7 5 2.3C11.8 4.7 13.7 3.7 15.7 4c3.3.5 5 3.8 3.5 7.3-2.3 4.6-9.8 9.2-9.8 9.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
