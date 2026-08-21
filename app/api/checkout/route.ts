import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, cartTotals } from "@/lib/cart";
import { stripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { allowed } = rateLimit(`checkout:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Payments aren't configured yet. Add STRIPE_SECRET_KEY to your environment." },
      { status: 503 },
    );
  }

  const cart = await getOrCreateCart(user.id);
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Recompute prices and stock server-side from the database — never trust
  // client-submitted prices or quantities for a payment amount.
  for (const item of cart.items) {
    if (item.variant && item.variant.stock < item.quantity) {
      return NextResponse.json(
        { error: `${item.product.name} (${item.variant.name}) doesn't have enough stock.` },
        { status: 409 },
      );
    }
  }

  const totals = cartTotals(cart.items);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const orderNumber = `HH-${Date.now().toString(36).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: user.id,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      status: "PENDING",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.product.basePrice + (item.variant?.priceDelta ?? 0),
          nameSnapshot: item.variant
            ? `${item.product.name} — ${item.variant.name}`
            : item.product.name,
        })),
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: cart.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.product.basePrice + (item.variant?.priceDelta ?? 0),
        product_data: {
          name: item.variant ? `${item.product.name} — ${item.variant.name}` : item.product.name,
          images: item.product.images.slice(0, 1),
        },
      },
    })),
    shipping_options:
      totals.shipping > 0
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: totals.shipping, currency: "usd" },
                display_name: "Standard shipping",
              },
            },
          ]
        : undefined,
    success_url: `${siteUrl}/checkout/success?order=${order.orderNumber}`,
    cancel_url: `${siteUrl}/cart`,
    metadata: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
