"use client";

import { AdminPaymentsQueue } from "@/components/admin/admin-payments-queue";
export default function AdminPaymentsPage() {
  return (
    <div className="min-w-0">
      <h1 className="page-title font-semibold">Payments</h1>
      <p className="mt-2 text-sm text-ink/55">
        Confirm bank transfers from WhatsApp, then fulfillment unlocks on the order. You can also confirm from each
        order page.
      </p>
      <AdminPaymentsQueue />
    </div>
  );
}
