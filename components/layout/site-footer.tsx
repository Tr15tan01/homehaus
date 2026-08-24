import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export default function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-t border-stone/70 bg-surface transition-colors">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-xl">HomeHaus</p>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">{dict.footer.tagline}</p>
        </div>

        <FooterColumn
          title={dict.footer.shop}
          links={[
            { href: "/products?group=DECOR", label: dict.nav.decor },
            { href: "/products?group=SMART_HOME", label: dict.nav.smartHome },
            { href: "/rooms", label: dict.nav.shopByRoom },
            { href: "/products?featured=true", label: dict.footer.featured },
          ]}
        />
        <FooterColumn
          title={dict.footer.help}
          links={[
            { href: "/shipping", label: dict.footer.shipping },
            { href: "/contact", label: dict.footer.contact },
            { href: "/account/orders", label: dict.footer.trackOrder },
          ]}
        />
        <FooterColumn
          title={dict.footer.company}
          links={[
            { href: "/about", label: dict.footer.about },
            { href: "/sustainability", label: dict.footer.sustainability },
          ]}
        />
      </div>
      <div className="border-t border-stone/70 px-6 py-6 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} HomeHaus. {dict.footer.rights}
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
