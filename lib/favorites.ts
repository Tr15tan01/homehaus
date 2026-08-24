import "server-only";
import { prisma } from "@/lib/prisma";

export async function getFavoriteProductIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(favorites.map((f) => f.productId));
}
