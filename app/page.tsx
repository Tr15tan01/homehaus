import Link from "next/link";
import Image from "next/image";
import { listFeaturedProducts, listCategories } from "@/lib/products";
import ProductCard from "@/components/product/product-card";

const ROOMS = [
  { key: "LIVING_ROOM", label: "Living Room", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80" },
  { key: "BEDROOM", label: "Bedroom", img: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&q=80" },
  { key: "KITCHEN", label: "Kitchen", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80" },
  { key: "ENTRYWAY", label: "Entryway", img: "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=800&q=80" },
];

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    listFeaturedProducts(4),
    listCategories(),
  ]);

  return (
    <div>
      {/* Hero — editorial split, signature glow-dot as the live "moment" */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-ink-soft">
            Home decor &amp; smart devices
          </p>
          <h1 className="font-display text-5xl italic leading-[1.05] md:text-6xl">
            Quietly smart,
            <br />
            beautifully placed.
          </h1>
          <p className="mt-6 max-w-md text-ink-soft">
            We choose every device the way we choose every vase — by how it
            lives in your room. No blinking hubs, no gadget-aisle clutter.
            Just pieces that belong.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-moss px-6 py-3 text-sm font-medium text-white transition hover:bg-moss-dark"
            >
              Shop all
            </Link>
            <Link
              href="/rooms"
              className="rounded-full border border-stone-dark px-6 py-3 text-sm font-medium text-ink transition hover:border-ink"
            >
              Shop by room
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface md:aspect-square">
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
            Table lamp — on, dimmed for evening
          </div>
        </div>
      </section>

      {/* Shop by room */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl">Shop by room</h2>
          <Link href="/rooms" className="text-sm text-moss underline underline-offset-2">
            View all rooms
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ROOMS.map((room) => (
            <Link
              key={room.key}
              href={`/products?room=${room.key}`}
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={room.img}
                alt={room.label}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-4 font-display text-lg text-white">
                {room.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl">Featured this season</h2>
            <Link href="/products?featured=true" className="text-sm text-moss underline underline-offset-2">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Assistant callout */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-moss px-8 py-12 text-plaster md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-plaster/70">
              <span className="glow-dot" aria-hidden="true" />
              HomeHaus Assistant
            </p>
            <h2 className="font-display text-3xl italic md:text-4xl">
              Describe your room. We&apos;ll style it.
            </h2>
            <p className="mt-3 max-w-md text-plaster/80">
              Tell the assistant what you&apos;re working with — a small
              bedroom, a bare entryway, a kitchen that needs warmth — and get
              a curated set back in seconds.
            </p>
          </div>
          <p className="rounded-full border border-plaster/30 px-5 py-2.5 text-sm text-plaster/70">
            Open the assistant in the corner →
          </p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <h2 className="mb-6 font-display text-2xl">Browse categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="rounded-full border border-stone-dark px-4 py-2 text-sm text-ink-soft transition hover:border-ink hover:text-ink"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
