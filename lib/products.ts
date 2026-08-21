import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma, ProductGroup, RoomType } from "@prisma/client";

export type ProductFilters = {
  group?: ProductGroup;
  categorySlug?: string;
  room?: RoomType;
  featured?: boolean;
  query?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  page?: number;
  pageSize?: number;
};

export async function listProducts(filters: ProductFilters) {
  const {
    group,
    categorySlug,
    room,
    featured,
    query,
    sort = "newest",
    page = 1,
    pageSize = 12,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(group ? { group } : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(room ? { room: { has: room } } : {}),
    ...(featured ? { featured: true } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { shortDescription: { contains: query, mode: "insensitive" } },
            { materials: { hasSome: [query] } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { basePrice: "asc" }
      : sort === "price-desc"
        ? { basePrice: "desc" }
        : sort === "rating"
          ? { avgRating: "desc" }
          : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string) {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId,
      id: { not: productId },
    },
    take: 4,
  });
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function listFeaturedProducts(take = 4) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", featured: true },
    take,
    orderBy: { createdAt: "desc" },
  });
}
