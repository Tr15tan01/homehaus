import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { updateOrderStatusAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Orders · Admin",
  robots: { index: false, follow: false },
};

const STATUSES = ["PENDING", "PAID", "FULFILLED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    where: { status: { not: "PENDING" } },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-stone text-left text-ink-soft">
            <th className="py-2 font-normal">Order</th>
            <th className="py-2 font-normal">Customer</th>
            <th className="py-2 font-normal">Date</th>
            <th className="py-2 font-normal text-right">Total</th>
            <th className="py-2 font-normal text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-stone/60">
              <td className="py-2.5 font-mono text-xs">{order.orderNumber}</td>
              <td className="py-2.5">
                {order.user.name}
                <span className="block text-xs text-ink-soft">{order.user.email}</span>
              </td>
              <td className="py-2.5 text-ink-soft">{order.createdAt.toLocaleDateString()}</td>
              <td className="py-2.5 text-right">{formatPrice(order.total)}</td>
              <td className="py-2.5 text-right">
                <form action={updateOrderStatusAction} className="inline-flex items-center gap-2">
                  <input type="hidden" name="orderId" value={order.id} />
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="rounded-lg border border-stone bg-surface px-2 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="text-xs text-moss underline">
                    Save
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
