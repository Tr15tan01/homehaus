"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation";
import { addItemToCart } from "@/lib/cart";

export async function addToCartAction(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId"));
  const variantId = formData.get("variantId")
    ? String(formData.get("variantId"))
    : null;
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));

  await addItemToCart(user.id, productId, variantId, quantity);

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function updateCartItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("itemId"));
  const quantity = Number(formData.get("quantity"));

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== user.id) return;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeCartItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("itemId"));

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== user.id) return;

  await prisma.cartItem.delete({ where: { id: itemId } });
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function toggleFavoriteAction(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId"));

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId: user.id, productId } });
  }

  revalidatePath("/account/favorites");
}

export type ReviewFormState = { error?: string } | undefined;

export async function submitReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await requireUser();

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review." };
  }

  const { productId, rating, title, comment } = parsed.data;

  const hasPurchased = await prisma.orderItem.findFirst({
    where: { productId, order: { userId: user.id, status: { not: "CANCELLED" } } },
  });

  await prisma.review.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: { rating, title: title || null, comment, verified: Boolean(hasPurchased) },
    create: {
      userId: user.id,
      productId,
      rating,
      title: title || null,
      comment,
      verified: Boolean(hasPurchased),
    },
  });

  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (product) redirect(`/products/${product.slug}`);
}
