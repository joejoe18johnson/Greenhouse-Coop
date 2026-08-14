"use client";

import { getOrders, getUsers } from "@/lib/store";
import { formatBZD } from "@/lib/utils";

export default function AdminCustomersPage() {
  const users = getUsers().filter((u) => u.role === "customer");
  const orders = getOrders();
  return (
    <div>
      <h1 className="font-display text-4xl text-forest-dark">Customers</h1>
      <div className="mt-6 space-y-3">
        {users.map((u) => {
          const theirs = orders.filter((o) => o.userId === u.id);
          const spent = theirs.reduce((s, o) => s + o.total, 0);
          return (
            <div key={u.id} className="rounded-[24px] bg-white p-5">
              <p className="font-semibold text-forest">{u.firstName} {u.lastName}</p>
              <p className="text-sm text-ink/60">{u.email} · {u.phone}</p>
              {u.addresses[0] && (
                <p className="mt-1 text-sm text-ink/50">{u.addresses[0].fullAddress}, {u.addresses[0].town}, {u.addresses[0].district}</p>
              )}
              <p className="mt-2 text-sm">{theirs.length} orders · {formatBZD(spent)}</p>
            </div>
          );
        })}
        {users.length === 0 && <p className="text-ink/50">No customer accounts yet.</p>}
      </div>
    </div>
  );
}
