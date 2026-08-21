import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind HomeHaus — home decor and smart devices chosen for how they look in a room.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl">About HomeHaus</h1>
      <p className="mt-6 text-ink-soft">
        Most smart home shopping still feels like browsing the electronics
        aisle — a wall of specs, plastic, and blinking lights. We started
        HomeHaus on a simple rule: if a device wouldn&apos;t look at home
        sitting next to a piece of decor you actually love, it doesn&apos;t
        belong in the catalog.
      </p>
      <p className="mt-4 text-ink-soft">
        Every product, tech or not, is chosen the same way — for materials,
        proportion, and how it lives in a room over time. The result is a
        smaller, more considered catalog than a typical marketplace, and a
        home that feels calm instead of cluttered with gadgets.
      </p>
    </div>
  );
}
