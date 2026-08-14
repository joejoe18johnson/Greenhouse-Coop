import { Info } from "lucide-react";
import { INVENTORY_NOTICE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function InventoryNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-citrus/30 bg-citrus/10 px-4 py-3 text-sm leading-relaxed text-ink/80",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-citrus" />
      <p>
        <span className="font-semibold text-forest">Inventory notice. </span>
        {INVENTORY_NOTICE}
      </p>
    </div>
  );
}
