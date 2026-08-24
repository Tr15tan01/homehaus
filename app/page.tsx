import Link from "next/link";
import Image from "next/image";
import { listFeaturedProducts, listCategories } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, pick } from "@/lib/locale";
import { getDictionary, ROOM_LABELS } from "@/lib/i18n";
import { getFavoriteProductIds } from "@/lib/favorites";
import ProductCard from "@/components/product/product-card";
import RecentlyViewedStrip from "@/components/product/recently-viewed";

const ROOMS = [
  {
    key: "LIVING_ROOM",
    img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
  },
  {
    key: "BEDROOM",
    img: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&q=80",
  },
  {
    key: "KITCHEN",
    img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
  },
  {
    key: "ENTRYWAY",
    img: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=800&q=80",
  },
];

export default async function HomePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const user = await getCurrentUser();

  const [featured, categories, favoriteIds] = await Promise.all([
    listFeaturedProducts(4),
    listCategories(),
    getFavoriteProductIds(user?.id ?? null),
  ]);

  const roomLabels = ROOM_LABELS[locale];

  return (
    <div>
      {/* Hero — editorial split, signature glow-dot as the live "moment" */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brass/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-ink-soft">
              {dict.home.heroEyebrow}
            </p>
            <h1 className="font-display text-5xl italic leading-[1.05] md:text-6xl">
              {dict.home.heroTitleLine1}
              <br />
              {dict.home.heroTitleLine2}
            </h1>
            <p className="mt-6 max-w-md text-ink-soft">{dict.home.heroBody}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full bg-moss px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-moss-dark hover:shadow-md"
              >
                {dict.home.shopAll}
              </Link>
              <Link
                href="/rooms"
                className="rounded-full border border-stone-dark px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
              >
                {dict.home.shopByRoom}
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface shadow-xl md:aspect-square">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80"
              alt="A softly lit living room with a ceramic table lamp and woven textiles"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-surface-raised/90 px-3.5 py-2 text-xs font-medium text-ink backdrop-blur">
              <span className="glow-dot" aria-hidden="true" />
              {dict.home.lampCaption}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-stone/60 bg-surface/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-6 sm:grid-cols-3">
          <TrustItem
            icon={<TruckIcon />}
            title={dict.home.trustFreeShipping}
            subtitle={dict.home.trustFreeShippingSub}
          />
          <TrustItem
            icon={<ReturnIcon />}
            title={dict.home.trustReturns}
            subtitle={dict.home.trustReturnsSub}
          />
          <TrustItem
            icon={<LockIcon />}
            title={dict.home.trustSecure}
            subtitle={dict.home.trustSecureSub}
          />
        </div>
      </section>

      {/* Shop by room */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl">
            {dict.home.shopByRoomHeading}
          </h2>
          <Link
            href="/rooms"
            className="text-sm text-moss underline underline-offset-2"
          >
            {dict.home.viewAllRooms}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ROOMS.map((room) => (
            <Link
              key={room.key}
              href={`/products?room=${room.key}`}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-lg"
            >
              <Image
                src={room.img}
                alt={roomLabels[room.key]}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-4 font-display text-lg text-white">
                {roomLabels[room.key]}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl">
              {dict.home.featuredHeading}
            </h2>
            <Link
              href="/products?featured=true"
              className="text-sm text-moss underline underline-offset-2"
            >
              {dict.home.viewAll}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
            {featured.map((product) => (
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
        </section>
      )}

      {/* Recently viewed */}
      <RecentlyViewedStrip heading={dict.home.recentlyViewedHeading} />

      {/* Assistant callout */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="relative overflow-hidden flex flex-col items-start gap-6 rounded-3xl bg-moss px-8 py-12 text-plaster md:flex-row md:items-center md:justify-between">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brass/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-plaster/70">
              <span className="glow-dot" aria-hidden="true" />
              {dict.home.assistantEyebrow}
            </p>
            <h2 className="font-display text-3xl italic md:text-4xl">
              {dict.home.assistantHeading}
            </h2>
            <p className="mt-3 max-w-md text-plaster/80">
              {dict.home.assistantBody}
            </p>
          </div>
          <p className="relative rounded-full border border-plaster/30 px-5 py-2.5 text-sm text-plaster/70">
            {dict.home.assistantCta}
          </p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="mb-6 font-display text-2xl">
            {dict.home.categoriesHeading}
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="rounded-full border border-stone-dark px-4 py-2 text-sm text-ink-soft transition hover:border-ink hover:text-ink"
              >
                {pick(locale, c.name, c.nameKa)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TrustItem({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-raised text-moss">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 6h11v10H2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13 10h5l3 3v3h-8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle
        cx="6.5"
        cy="18"
        r="1.8"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle
        cx="17.5"
        cy="18"
        r="1.8"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10a8 8 0 1 1 2.3 5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4 5v5h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
