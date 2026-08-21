import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-stone/70 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-xl">HomeHaus</p>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
            Decor and smart home devices chosen for how they look in a room,
            not just what they do.
          </p>
        </div>

        <FooterColumn
          title="Shop"
          links={[
            { href: "/products?group=DECOR", label: "Decor" },
            { href: "/products?group=SMART_HOME", label: "Smart Home" },
            { href: "/rooms", label: "Shop by Room" },
            { href: "/products?featured=true", label: "Featured" },
          ]}
        />
        <FooterColumn
          title="Help"
          links={[
            { href: "/shipping", label: "Shipping & Returns" },
            { href: "/contact", label: "Contact" },
            { href: "/account/orders", label: "Track an Order" },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { href: "/about", label: "About" },
            { href: "/sustainability", label: "Sustainability" },
          ]}
        />
      </div>
      <div className="border-t border-stone/70 px-6 py-6 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} HomeHaus. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-ink">{title}</p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-ink-soft transition hover:text-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
