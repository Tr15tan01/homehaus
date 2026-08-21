import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Stripe webhooks must be verified with the raw request body — this route
// intentionally reads text() rather than json() before verifying the
// signature, or the signature check would fail/be bypassable.
export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        },
        include: { items: true },
      });

      // Decrement stock and clear the cart inside a single transaction so a
      // failure partway through can't leave stock or cart state inconsistent.
      await prisma.$transaction([
        ...order.items
          .filter((item) => item.variantId)
          .map((item) =>
            prisma.variant.update({
              where: { id: item.variantId! },
              data: { stock: { decrement: item.quantity } },
            }),
          ),
        prisma.cartItem.deleteMany({ where: { cart: { userId: order.userId } } }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
