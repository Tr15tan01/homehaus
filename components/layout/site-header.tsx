import Link from "next/link";
import type { SafeUser } from "@/lib/auth";
import { getCartCount } from "@/lib/cart";
import { logoutAction } from "@/app/(auth)/actions";

const NAV_LINKS = [
  { href: "/products?group=DECOR", label: "Decor" },
  { href: "/products?group=SMART_HOME", label: "Smart Home" },
  { href: "/rooms", label: "Shop by Room" },
];

export default async function SiteHeader({ user }: { user: SafeUser | null }) {
  const cartCount = await getCartCount(user?.id ?? null);

  return (
    <header className="sticky top-0 z-40 border-b border-stone/70 bg-plaster/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight">
          HomeHaus
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-soft transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/search"
            aria-label="Search"
            className="text-ink-soft transition hover:text-ink"
          >
            <SearchIcon />
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="relative text-ink-soft transition hover:text-ink"
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 font-mono text-[10px] font-bold text-ink">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden text-sm text-ink-soft transition hover:text-ink sm:inline"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/account"
                className="hidden text-sm text-ink-soft transition hover:text-ink sm:inline"
              >
                {user.name.split(" ")[0]}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm text-ink-soft underline underline-offset-2 transition hover:text-ink"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss-dark"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8h12l-1 12H7L6 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
