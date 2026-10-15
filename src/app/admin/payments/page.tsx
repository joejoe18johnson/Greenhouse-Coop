"use client";

import Link from "next/link";
import { AdminPaymentsQueue } from "@/components/admin/admin-payments-queue";
export default function AdminPaymentsPage() {
  return (
    <div className="min-w-0">
      <h1 className="page-title font-semibold">Payments</h1>
      <p className="mt-2 text-sm text-ink/55">
        New orders land in{" "}
        <Link href="/admin/orders" className="font-medium text-forest underline">
          Orders
        </Link>{" "}
        first — edit the customer, download the receipt, then confirm the deposit here (or on the order page). This
        queue is only for orders where payment proof was received on WhatsApp.
      </p>
      <AdminPaymentsQueue />
    </div>
  );
}
