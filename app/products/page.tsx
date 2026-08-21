import type { Metadata } from "next";
import Link from "next/link";
import { listProducts, listCategories } from "@/lib/products";
import ProductCard from "@/components/product/product-card";
import type { ProductGroup, RoomType } from "@prisma/client";
import { cn } from "@/lib/utils";
import SortSelect from "@/components/product/sort-select";

type SearchParams = {
  group?: string;
  category?: string;
  room?: string;
  featured?: string;
  sort?: string;
  page?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const title =
    params.group === "SMART_HOME"
      ? "Smart Home Devices"
      : params.group === "DECOR"
        ? "Home Decor"
        : "Shop All";

  return {
    title,
    description:
      "Browse curated home decor and smart home devices, chosen for how they look in a room.",
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const [{ items, pageCount, total }, categories] = await Promise.all([
    listProducts({
      group: params.group as ProductGroup | undefined,
      categorySlug: params.category,
      room: params.room as RoomType | undefined,
      featured: params.featured === "true",
      sort: (params.sort as never) ?? "newest",
      page,
    }),
    listCategories(),
  ]);

  const buildHref = (overrides: Partial<SearchParams>) => {
    const merged = { ...params, ...overrides, page: undefined };
    const qs = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => v) as [string, string][],
    ).toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-4xl">
        {params.group === "SMART_HOME"
          ? "Smart Home"
          : params.group === "DECOR"
            ? "Decor"
            : "Shop All"}
      </h1>
      <p className="mt-2 text-ink-soft">{total} pieces</p>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <FilterPill href={buildHref({ group: undefined })} active={!params.group}>
          All
        </FilterPill>
        <FilterPill href={buildHref({ group: "DECOR" })} active={params.group === "DECOR"}>
          Decor
        </FilterPill>
        <FilterPill
          href={buildHref({ group: "SMART_HOME" })}
          active={params.group === "SMART_HOME"}
        >
          Smart Home
        </FilterPill>
        <span className="mx-2 h-4 w-px bg-stone" aria-hidden="true" />
        {categories.map((c) => (
          <FilterPill
            key={c.id}
            href={buildHref({ category: c.slug })}
            active={params.category === c.slug}
          >
            {c.name}
          </FilterPill>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-b border-stone pb-4">
        <p className="text-sm text-ink-soft">
          Page {page} of {Math.max(pageCount, 1)}
        </p>
        <SortSelect value={params.sort ?? "newest"} baseHref={buildHref({ sort: undefined })} />
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-ink-soft">
          No products match those filters yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: String(p) })}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm",
                p === page ? "bg-moss text-white" : "text-ink-soft hover:bg-surface",
              )}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition",
        active
          ? "border-moss bg-moss text-white"
          : "border-stone-dark text-ink-soft hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
