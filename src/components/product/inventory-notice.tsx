import { INVENTORY_NOTICE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function InventoryNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-citrus/30 bg-citrus/10 px-4 py-3 text-sm leading-relaxed text-ink/80",
        className
      )}
    >
      <span className="font-semibold text-forest">Inventory notice. </span>
      {INVENTORY_NOTICE}
    </div>
  );
}
