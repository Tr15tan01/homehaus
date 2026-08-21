import Link from "next/link";
import { requireAdminOrRedirect } from "@/lib/auth";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is the real authorization boundary for the whole /admin tree —
  // middleware only checks that a session cookie exists, not the role.
  await requireAdminOrRedirect();

  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-6 py-12">
      <aside className="w-48 shrink-0">
        <p className="mb-4 font-display text-xl">Dashboard</p>
        <nav className="space-y-1" aria-label="Admin">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-surface hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
