import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your Orders",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending payment",
  PAID: "Paid",
  FULFILLED: "Preparing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default async function OrdersPage() {
  const user = await requireUserOrRedirect();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl">Your orders</h1>

      {orders.length === 0 ? (
        <p className="mt-8 text-ink-soft">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-stone bg-surface p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm">{order.orderNumber}</p>
                <span className="rounded-full bg-plaster px-3 py-1 text-xs text-ink-soft">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {order.createdAt.toLocaleDateString()} · {order.items.length} item
                {order.items.length === 1 ? "" : "s"} · {formatPrice(order.total)}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-ink-soft">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.nameSnapshot}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
