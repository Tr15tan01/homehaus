import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { addItemToCart } from "@/lib/cart";

// Every tool here is READ-ONLY except addToCart, which only stages an
// item — it never charges a card or places an order. That happens only
// when the signed-in user explicitly goes through /checkout themselves.

export function buildAssistantTools(userId: string | null) {
  return {
    searchProducts: tool({
      description:
        "Search the HomeHaus catalog by keyword, room, product group, or price range. Use this whenever the person describes what they're looking for.",
      inputSchema: z.object({
        query: z.string().optional().describe("Free-text search, e.g. 'ceramic table lamp'"),
        room: z
          .enum([
            "LIVING_ROOM",
            "BEDROOM",
            "KITCHEN",
            "BATHROOM",
            "ENTRYWAY",
            "OFFICE",
            "OUTDOOR",
            "WHOLE_HOME",
          ])
          .optional(),
        group: z.enum(["DECOR", "SMART_HOME"]).optional(),
        maxPriceCents: z.number().optional(),
        limit: z.number().min(1).max(10).default(6),
      }),
      execute: async ({ query, room, group, maxPriceCents, limit }) => {
        const products = await prisma.product.findMany({
          where: {
            status: "ACTIVE",
            ...(group ? { group } : {}),
            ...(room ? { room: { has: room } } : {}),
            ...(maxPriceCents ? { basePrice: { lte: maxPriceCents } } : {}),
            ...(query
              ? {
                  OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { shortDescription: { contains: query, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          take: limit,
          orderBy: { avgRating: "desc" },
        });

        return products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: formatPrice(p.basePrice),
          group: p.group,
          shortDescription: p.shortDescription,
        }));
      },
    }),

    getProductDetails: tool({
      description: "Get full details for a single product by its id or slug.",
      inputSchema: z.object({ idOrSlug: z.string() }),
      execute: async ({ idOrSlug }) => {
        const product = await prisma.product.findFirst({
          where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], status: "ACTIVE" },
          include: { variants: true },
        });
        if (!product) return { found: false };
        return {
          found: true,
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: formatPrice(product.basePrice),
          description: product.description,
          materials: product.materials,
          smartFeatures: product.smartFeatures,
          avgRating: product.avgRating,
          reviewCount: product.reviewCount,
          variants: product.variants.map((v) => ({ id: v.id, name: v.name, inStock: v.stock > 0 })),
        };
      },
    }),

    buildRoomSet: tool({
      description:
        "Assemble a small curated set of products (3-5 items) for a described room and budget. Prefer variety across categories over near-duplicates.",
      inputSchema: z.object({
        room: z.enum([
          "LIVING_ROOM",
          "BEDROOM",
          "KITCHEN",
          "BATHROOM",
          "ENTRYWAY",
          "OFFICE",
          "OUTDOOR",
          "WHOLE_HOME",
        ]),
        totalBudgetCents: z.number().optional(),
        includeSmartHome: z.boolean().default(true),
      }),
      execute: async ({ room, totalBudgetCents, includeSmartHome }) => {
        const products = await prisma.product.findMany({
          where: {
            status: "ACTIVE",
            room: { has: room },
            ...(includeSmartHome ? {} : { group: "DECOR" }),
          },
          orderBy: { avgRating: "desc" },
          take: 12,
        });

        const set: typeof products = [];
        let runningTotal = 0;
        for (const p of products) {
          if (totalBudgetCents && runningTotal + p.basePrice > totalBudgetCents) continue;
          set.push(p);
          runningTotal += p.basePrice;
          if (set.length >= 5) break;
        }

        return {
          room,
          items: set.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: formatPrice(p.basePrice),
            group: p.group,
          })),
          totalPrice: formatPrice(runningTotal),
        };
      },
    }),

    checkStock: tool({
      description: "Check whether a specific product variant is in stock.",
      inputSchema: z.object({ variantId: z.string() }),
      execute: async ({ variantId }) => {
        const variant = await prisma.variant.findUnique({ where: { id: variantId } });
        if (!variant) return { found: false };
        return { found: true, inStock: variant.stock > 0, stock: variant.stock };
      },
    }),

    addToCart: tool({
      description:
        "Add a product to the signed-in shopper's cart. Only call this after the person has clearly confirmed they want this specific item added — never add speculatively while just discussing options.",
      inputSchema: z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().min(1).max(10).default(1),
      }),
      execute: async ({ productId, variantId, quantity }) => {
        if (!userId) {
          return { added: false, reason: "not_signed_in" as const };
        }

        await addItemToCart(userId, productId, variantId ?? null, quantity);

        return { added: true };
      },
    }),
  };
}
