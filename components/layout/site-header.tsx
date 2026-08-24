import Link from "next/link";
import type { SafeUser } from "@/lib/auth";
import type { Locale } from "@/lib/locale";
import type { Dictionary } from "@/lib/i18n";
import { getCartCount } from "@/lib/cart";
import { logoutAction } from "@/app/(auth)/actions";
import LocaleSwitcher from "@/components/layout/locale-switcher";
import ThemeToggle from "@/components/theme-toggle";

export default async function SiteHeader({
  user,
  locale,
  dict,
}: {
  user: SafeUser | null;
  locale: Locale;
  dict: Dictionary;
}) {
  const cartCount = await getCartCount(user?.id ?? null);

  const navLinks = [
    { href: "/products?group=DECOR", label: dict.nav.decor },
    { href: "/products?group=SMART_HOME", label: dict.nav.smartHome },
    { href: "/rooms", label: dict.nav.shopByRoom },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-stone/70 bg-plaster/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight">
          HomeHaus
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm text-ink-soft transition after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-moss after:transition-all hover:text-ink hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher locale={locale} />
          <ThemeToggle labels={dict.theme} />

          <Link
            href="/search"
            aria-label={dict.nav.search}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-surface hover:text-ink"
          >
            <SearchIcon />
          </Link>

          <Link
            href="/cart"
            aria-label={`${dict.nav.cart}, ${cartCount}`}
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-surface hover:text-ink"
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 font-mono text-[10px] font-bold text-ink">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3 pl-1">
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden text-sm text-ink-soft transition hover:text-ink sm:inline"
                >
                  {dict.nav.dashboard}
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
                  {dict.nav.signOut}
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-1 rounded-full bg-moss px-4 py-2 text-sm font-medium text-white transition hover:bg-moss-dark"
            >
              {dict.nav.signIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
