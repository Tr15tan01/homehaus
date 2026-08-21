import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/auth";
import { getOrCreateCart, cartTotals } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import CheckoutButton from "@/components/checkout/checkout-button";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await requireUserOrRedirect();
  const cart = await getOrCreateCart(user.id);
  const totals = cartTotals(cart.items);

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="mt-2 text-ink-soft">
        {cart.items.length} item{cart.items.length === 1 ? "" : "s"} ·{" "}
        {formatPrice(totals.total)} total
      </p>
      <p className="mt-8 text-sm text-ink-soft">
        You&apos;ll be taken to Stripe to complete payment securely — HomeHaus
        never sees or stores your card details.
      </p>
      <div className="mt-8">
        <CheckoutButton disabled={cart.items.length === 0} />
      </div>
    </div>
  );
}
