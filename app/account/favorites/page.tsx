import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Your Favorites",
  robots: { index: false, follow: false },
};

export default async function FavoritesPage() {
  const user = await requireUserOrRedirect();
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl">Your favorites</h1>

      {favorites.length === 0 ? (
        <p className="mt-8 text-ink-soft">You haven&apos;t saved anything yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {favorites.map((f) => (
            <ProductCard key={f.id} product={f.product} />
          ))}
        </div>
      )}
    </div>
  );
}
