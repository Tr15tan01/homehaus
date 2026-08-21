import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns",
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-4xl">Shipping &amp; returns</h1>
      <div className="mt-6 space-y-4 text-ink-soft">
        <p>Standard shipping is free on orders over $75, and $8.95 otherwise. Most orders arrive within 4–7 business days.</p>
        <p>Not the right fit? Return any unused item within 30 days of delivery for a full refund.</p>
      </div>
    </div>
  );
}
