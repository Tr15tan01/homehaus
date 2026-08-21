import type { Metadata } from "next";
import { listProducts } from "@/lib/products";
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
  const { items } = q
    ? await listProducts({ query: q, pageSize: 24 })
    : { items: [] };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-4xl">Search</h1>
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
