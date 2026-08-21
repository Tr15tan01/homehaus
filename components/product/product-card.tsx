import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@prisma/client";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        )}
        {product.group === "SMART_HOME" && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-surface-raised/90 px-2.5 py-1 text-[11px] font-medium text-ink-soft backdrop-blur">
            <span className="glow-dot" aria-hidden="true" />
            Smart
          </span>
        )}
        {product.compareAtPrice && (
          <span className="absolute right-3 top-3 rounded-full bg-clay px-2.5 py-1 text-[11px] font-medium text-white">
            Sale
          </span>
        )}
      </div>
      <div className="mt-3 space-y-0.5">
        <p className="text-sm text-ink">{product.name}</p>
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
