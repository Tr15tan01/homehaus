import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-4xl">Contact</h1>
      <p className="mt-6 text-ink-soft">
        Questions about an order, a product, or a return? Reach us at{" "}
        <a href="mailto:hello@homehaus.example" className="text-moss underline underline-offset-2">
          hello@homehaus.example
        </a>{" "}
        and we&apos;ll get back to you within one business day.
      </p>
    </div>
  );
}
