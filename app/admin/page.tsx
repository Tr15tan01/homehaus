import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const [productCount, orderCount, revenue, lowStock] = await Promise.all([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({ where: { status: { not: "PENDING" } } }),
    prisma.order.aggregate({
      where: { status: { not: "PENDING" } },
      _sum: { total: true },
    }),
    prisma.variant.count({ where: { stock: { lte: 3, gt: 0 } } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    where: { status: { not: "PENDING" } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Overview</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Active products" value={productCount.toString()} />
        <Stat label="Orders" value={orderCount.toString()} />
        <Stat label="Revenue" value={formatPrice(revenue._sum.total ?? 0)} />
        <Stat label="Low stock variants" value={lowStock.toString()} warn={lowStock > 0} />
      </div>

      <h2 className="mt-12 font-display text-xl">Recent orders</h2>
      {recentOrders.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">No orders yet.</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-stone text-left text-ink-soft">
              <th className="py-2 font-normal">Order</th>
              <th className="py-2 font-normal">Customer</th>
              <th className="py-2 font-normal">Status</th>
              <th className="py-2 font-normal text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-stone/60">
                <td className="py-2.5 font-mono text-xs">{order.orderNumber}</td>
                <td className="py-2.5">{order.user.name}</td>
                <td className="py-2.5 text-ink-soft">{order.status}</td>
                <td className="py-2.5 text-right">{formatPrice(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-2xl border border-stone bg-surface p-5">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className={`mt-1 font-display text-2xl ${warn ? "text-clay" : ""}`}>{value}</p>
    </div>
  );
}
