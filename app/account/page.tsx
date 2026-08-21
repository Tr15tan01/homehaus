import type { Metadata } from "next";
import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await requireUserOrRedirect();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl">Hi, {user.name.split(" ")[0]}</h1>
      <p className="mt-2 text-ink-soft">{user.email}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="rounded-2xl border border-stone bg-surface p-6 transition hover:border-moss"
        >
          <p className="font-medium">Orders</p>
          <p className="mt-1 text-sm text-ink-soft">Track and review past purchases</p>
        </Link>
        <Link
          href="/account/favorites"
          className="rounded-2xl border border-stone bg-surface p-6 transition hover:border-moss"
        >
          <p className="font-medium">Favorites</p>
          <p className="mt-1 text-sm text-ink-soft">Items you&apos;ve saved</p>
        </Link>
      </div>
    </div>
  );
}
