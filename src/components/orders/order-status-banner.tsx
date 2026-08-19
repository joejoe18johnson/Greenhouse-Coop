import { BellRing, CheckCircle2, Clock3, Package, Truck } from "lucide-react";
import type { OrderStatus } from "@/types";
import type { PaymentPlan } from "@/lib/order-deposit";
import { customerStatusDescription, customerStatusHeadline } from "@/lib/order-status-messages";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<OrderStatus, { className: string; icon: typeof BellRing }> = {
  "Payment Pending": { className: "bg-citrus/10 text-forest", icon: Clock3 },
  "Payment Review": { className: "bg-amber-50 text-amber-900", icon: BellRing },
  Paid: { className: "bg-leaf/10 text-forest", icon: CheckCircle2 },
  Processing: { className: "bg-sky-50 text-sky-900", icon: Package },
  Shipped: { className: "bg-forest/10 text-forest", icon: Truck },
  Completed: { className: "bg-leaf/15 text-forest", icon: CheckCircle2 },
  Refunded: { className: "bg-red-50 text-red-800", icon: BellRing },
};

export function OrderStatusBanner({
  status,
  paymentPlan = "deposit",
}: {
  status: OrderStatus;
  paymentPlan?: PaymentPlan;
}) {
  const style = STATUS_STYLE[status];
  const Icon = style.icon;

  return (
    <div className={cn("mt-8 rounded-[28px] p-5 text-sm print:hidden", style.className)}>
      <p className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 shrink-0" />
        {customerStatusHeadline(status, paymentPlan)}
      </p>
      <p className="mt-2 leading-relaxed opacity-90">{customerStatusDescription(status, paymentPlan)}</p>
    </div>
  );
}
