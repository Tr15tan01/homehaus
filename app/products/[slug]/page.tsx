import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, pick, pickList } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import { getFavoriteProductIds } from "@/lib/favorites";
import { formatPrice } from "@/lib/utils";
import AddToCartForm from "@/components/product/add-to-cart-form";
import ProductCard from "@/components/product/product-card";
import ProductGallery from "@/components/product/product-gallery";
import ReviewForm from "@/components/product/review-form";
import TrackProductView from "@/components/product/track-product-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const [product, user] = await Promise.all([getProductBySlug(slug), getCurrentUser()]);

  if (!product) notFound();

  const [related, favoriteIds] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId),
    getFavoriteProductIds(user?.id ?? null),
  ]);

  const name = pick(locale, product.name, product.nameKa);
  const description = pick(locale, product.description, product.descriptionKa);
  const materials = pickList(locale, product.materials, product.materialsKa);
  const smartFeatures = pickList(locale, product.smartFeatures, product.smartFeaturesKa);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images,
    sku: product.id,
    brand: { "@type": "Brand", name: "HomeHaus" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.basePrice / 100).toFixed(2),
      availability:
        product.variants.some((v) => v.stock > 0) || product.variants.length === 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/products/${product.slug}`,
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.avgRating.toFixed(1),
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackProductView
        slug={product.slug}
        name={name}
        price={product.basePrice}
        image={product.images[0]}
      />

      <nav className="mb-8 text-sm text-ink-soft" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-ink">
          {dict.home.shopAll}
        </Link>{" "}
        / <span className="text-ink">{name}</span>
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        <ProductGallery images={product.images} alt={name} />

        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              {product.group === "SMART_HOME" && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
                  <span className="glow-dot" aria-hidden="true" />
                  {dict.product.smartHomeBadge}
                </span>
              )}
              <h1 className="font-display text-4xl">{name}</h1>
            </div>
          </div>

          {product.reviewCount > 0 && (
            <p className="mt-2 text-sm text-ink-soft">
              ★ {product.avgRating.toFixed(1)} ({product.reviewCount} review
              {product.reviewCount === 1 ? "" : "s"})
            </p>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl">{formatPrice(product.basePrice)}</span>
            {product.compareAtPrice && (
              <span className="text-ink-soft/60 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-6 text-ink-soft">{description}</p>

          {materials.length > 0 && (
            <p className="mt-4 text-sm text-ink-soft">
              <span className="text-ink">{dict.product.materials}:</span> {materials.join(", ")}
            </p>
          )}

          {smartFeatures.length > 0 && (
            <ul className="mt-4 space-y-1.5 font-mono text-xs text-ink-soft">
              {smartFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="glow-dot" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1">
              <AddToCartForm
                productId={product.id}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  name: pick(locale, v.name, v.nameKa),
                  stock: v.stock,
                }))}
                isAuthenticated={Boolean(user)}
                nextPath={`/products/${product.slug}`}
                labels={dict.product}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 border-t border-stone pt-10">
        <h2 className="font-display text-2xl">{dict.product.reviews}</h2>

        {product.reviews.length === 0 ? (
          <p className="mt-4 text-ink-soft">{dict.product.noReviews}</p>
        ) : (
          <ul className="mt-6 space-y-6">
            {product.reviews.map((review) => (
              <li key={review.id} className="border-b border-stone pb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{review.user.name}</span>
                  {review.verified && (
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-ink-soft">
                      {dict.product.verifiedPurchase}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-soft">★ {review.rating} / 5</p>
                {review.title && <p className="mt-2 font-medium">{review.title}</p>}
                <p className="mt-1 text-sm text-ink-soft">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}

        {user ? (
          <div className="mt-10">
            <h3 className="mb-3 font-medium">{dict.product.writeReview}</h3>
            <ReviewForm productId={product.id} />
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-soft">
            <Link
              href={`/login?next=/products/${product.slug}`}
              className="text-moss underline underline-offset-2"
            >
              {dict.nav.signIn}
            </Link>{" "}
            — {dict.product.signInToReview}
          </p>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl">{dict.product.youMightAlsoLike}</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                locale={locale}
                isFavorited={favoriteIds.has(p.id)}
                isAuthenticated={Boolean(user)}
                smartBadgeLabel={dict.product.smartHomeBadge}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
