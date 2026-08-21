import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import AddToCartForm from "@/components/product/add-to-cart-form";
import ProductCard from "@/components/product/product-card";
import ReviewForm from "@/components/product/review-form";

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
  const [product, user] = await Promise.all([
    getProductBySlug(slug),
    getCurrentUser(),
  ]);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId);

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
      availability: product.variants.some((v) => v.stock > 0) || product.variants.length === 0
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

      <nav className="mb-8 text-sm text-ink-soft" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-ink">
          Shop
        </Link>{" "}
        / <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="grid gap-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                  <Image src={img} alt="" fill sizes="20vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.group === "SMART_HOME" && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
              <span className="glow-dot" aria-hidden="true" />
              Smart home
            </span>
          )}
          <h1 className="font-display text-4xl">{product.name}</h1>

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

          <p className="mt-6 text-ink-soft">{product.description}</p>

          {product.materials.length > 0 && (
            <p className="mt-4 text-sm text-ink-soft">
              <span className="text-ink">Materials:</span> {product.materials.join(", ")}
            </p>
          )}

          {product.smartFeatures.length > 0 && (
            <ul className="mt-4 space-y-1.5 font-mono text-xs text-ink-soft">
              {product.smartFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="glow-dot" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <AddToCartForm
              productId={product.id}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                stock: v.stock,
              }))}
              isAuthenticated={Boolean(user)}
              nextPath={`/products/${product.slug}`}
            />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 border-t border-stone pt-10">
        <h2 className="font-display text-2xl">Reviews</h2>

        {product.reviews.length === 0 ? (
          <p className="mt-4 text-ink-soft">No reviews yet — be the first.</p>
        ) : (
          <ul className="mt-6 space-y-6">
            {product.reviews.map((review) => (
              <li key={review.id} className="border-b border-stone pb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{review.user.name}</span>
                  {review.verified && (
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-ink-soft">
                      Verified purchase
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
            <h3 className="mb-3 font-medium">Write a review</h3>
            <ReviewForm productId={product.id} />
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-soft">
            <Link href={`/login?next=/products/${product.slug}`} className="text-moss underline underline-offset-2">
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl">You might also like</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
