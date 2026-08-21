import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <span className="glow-dot mx-auto mb-6 !h-3 !w-3" aria-hidden="true" />
      <h1 className="font-display text-4xl">Order confirmed</h1>
      {order && (
        <p className="mt-2 font-mono text-sm text-ink-soft">Order #{order}</p>
      )}
      <p className="mt-4 text-ink-soft">
        Thank you — a confirmation has been sent to your email. You can track
        this order any time from your account.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/account/orders"
          className="rounded-full bg-moss px-6 py-3 text-sm font-medium text-white hover:bg-moss-dark"
        >
          View orders
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-stone-dark px-6 py-3 text-sm font-medium hover:border-ink"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
