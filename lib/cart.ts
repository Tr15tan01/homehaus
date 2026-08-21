import "server-only";
import { prisma } from "@/lib/prisma";

// A compound-unique index on [cartId, productId, variantId] doesn't behave
// the way you'd want here: Postgres treats every NULL as distinct, so two
// upserts for the same product-with-no-variant would silently create two
// rows instead of merging. This helper does an explicit find-then-write
// instead, which is correct for both the "has a variant" and "no variant"
// cases, and is shared by the cart server actions and the AI assistant's
// addToCart tool so both go through the exact same logic.
export async function addItemToCart(
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, productId, variantId, quantity },
  });
}

export async function getOrCreateCart(userId: string) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: { product: true, variant: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return cart;
}

export async function getCartCount(userId: string | null): Promise<number> {
  if (!userId) return 0;
  const result = await prisma.cartItem.aggregate({
    where: { cart: { userId } },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

export function cartTotals(
  items: Array<{
    quantity: number;
    product: { basePrice: number };
    variant: { priceDelta: number } | null;
  }>,
) {
  const subtotal = items.reduce((sum, item) => {
    const unit = item.product.basePrice + (item.variant?.priceDelta ?? 0);
    return sum + unit * item.quantity;
  }, 0);
  const shipping = subtotal === 0 || subtotal >= 7500 ? 0 : 895;
  const tax = Math.round(subtotal * 0.0);
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}
