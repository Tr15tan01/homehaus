import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { deleteProductAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Products · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-moss px-5 py-2.5 text-sm font-medium text-white hover:bg-moss-dark"
        >
          New product
        </Link>
      </div>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-stone text-left text-ink-soft">
            <th className="py-2 font-normal">Name</th>
            <th className="py-2 font-normal">Category</th>
            <th className="py-2 font-normal">Status</th>
            <th className="py-2 font-normal text-right">Price</th>
            <th className="py-2 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-stone/60">
              <td className="py-2.5">{product.name}</td>
              <td className="py-2.5 text-ink-soft">{product.category.name}</td>
              <td className="py-2.5 text-ink-soft">{product.status}</td>
              <td className="py-2.5 text-right">{formatPrice(product.basePrice)}</td>
              <td className="py-2.5 text-right">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-moss underline underline-offset-2"
                >
                  Edit
                </Link>{" "}
                <form action={deleteProductAction} className="inline">
                  <input type="hidden" name="id" value={product.id} />
                  <button type="submit" className="ml-3 text-ink-soft underline hover:text-error">
                    Archive
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
