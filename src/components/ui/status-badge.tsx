import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STYLES: Record<OrderStatus, string> = {
  "Payment Pending": "bg-citrus/15 text-citrus",
  "Payment Review": "bg-amber-100 text-amber-800",
  Paid: "bg-leaf/15 text-forest",
  Processing: "bg-forest/15 text-forest-dark",
  Shipped: "bg-forest text-cream",
  Completed: "bg-lime/20 text-forest-dark",
  Refunded: "bg-ink/10 text-ink/60",
};

export function StatusBadge({ status }: { status: OrderStatus | string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        STYLES[status as OrderStatus] ?? "bg-forest/10 text-forest"
      )}
    >
      {status}
    </span>
  );
}
