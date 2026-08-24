import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { requireUserOrRedirect } from "@/lib/auth";
import { getOrCreateCart, cartTotals } from "@/lib/cart";
import { getLocale, pick } from "@/lib/locale";
import { formatPrice } from "@/lib/utils";
import { updateCartItemAction, removeCartItemAction } from "@/app/(shop)/actions";
import SubmitButton from "@/components/ui/submit-button";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const user = await requireUserOrRedirect();
  const [cart, locale] = await Promise.all([getOrCreateCart(user.id), getLocale()]);
  const totals = cartTotals(cart.items);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-4xl">Your cart</h1>

      {cart.items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-ink-soft">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-moss px-6 py-3 text-sm font-medium text-white hover:bg-moss-dark"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          <ul className="space-y-6 md:col-span-2">
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-4 border-b border-stone pb-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface">
                  {item.product.images[0] && (
                    <Image
                      src={item.product.images[0]}
                      alt={pick(locale, item.product.name, item.product.nameKa)}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {pick(locale, item.product.name, item.product.nameKa)}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-ink-soft">
                        {pick(locale, item.variant.name, item.variant.nameKa)}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-ink-soft">
                      {formatPrice(item.product.basePrice + (item.variant?.priceDelta ?? 0))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <form action={updateCartItemAction} className="flex items-center gap-2">
                      <input type="hidden" name="itemId" value={item.id} />
                      <label className="sr-only" htmlFor={`qty-${item.id}`}>
                        Quantity
                      </label>
                      <select
                        id={`qty-${item.id}`}
                        name="quantity"
                        defaultValue={item.quantity}
                        className="rounded-lg border border-stone bg-surface px-2 py-1 text-sm"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <SubmitButton className="!bg-transparent !px-2 !py-1 !text-ink-soft underline hover:!bg-transparent hover:!text-ink">
                        Update
                      </SubmitButton>
                    </form>
                    <form action={removeCartItemAction}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <button type="submit" className="text-sm text-ink-soft underline hover:text-error">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-2xl bg-surface p-6">
            <h2 className="font-medium">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-stone pt-2 font-medium">
                <dt>Total</dt>
                <dd>{formatPrice(totals.total)}</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="mt-6 block rounded-full bg-moss px-6 py-3 text-center text-sm font-medium text-white hover:bg-moss-dark"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
