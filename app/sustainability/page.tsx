import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sustainability",
};

export default function SustainabilityPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-4xl">Sustainability</h1>
      <p className="mt-6 text-ink-soft">
        We favor natural and long-lasting materials over disposable ones, and
        work with makers who build to last — because the most sustainable
        product is the one you don&apos;t replace in a year.
      </p>
    </div>
  );
}
