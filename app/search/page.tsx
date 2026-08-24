import type { Metadata } from "next";
import { listProducts } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import { getFavoriteProductIds } from "@/lib/favorites";
import ProductCard from "@/components/product/product-card";
import SearchBox from "@/components/product/search-box";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const user = await getCurrentUser();

  const [{ items }, favoriteIds] = await Promise.all([
    q ? listProducts({ query: q, pageSize: 24 }) : Promise.resolve({ items: [] }),
    getFavoriteProductIds(user?.id ?? null),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-4xl">{dict.nav.search}</h1>
      <div className="mt-6 max-w-md">
        <SearchBox defaultValue={q} />
      </div>

      {q && (
        <p className="mt-6 text-sm text-ink-soft">
          {items.length} result{items.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}

      {items.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              isFavorited={favoriteIds.has(product.id)}
              isAuthenticated={Boolean(user)}
              smartBadgeLabel={dict.product.smartHomeBadge}
            />
          ))}
        </div>
      )}
    </div>
  );
}
