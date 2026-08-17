"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterPills({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: string; label: string; count?: number; icon?: LucideIcon }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <p className="mb-3 text-[11px] font-semibold text-ink/40">
          {label}
        </p>
      )}
      <div
        className={cn(
          "flex gap-2 pb-1",
          "flex-nowrap overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:flex-wrap md:overflow-visible"
        )}
      >
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 min-h-11",
                active
                  ? "border-forest bg-forest text-cream shadow-md"
                  : "border-forest/15 bg-white/80 text-forest hover:border-forest/40 hover:bg-forest/5"
              )}
            >
              {option.icon && <option.icon className="h-3.5 w-3.5" />}
              {option.label}
              {typeof option.count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    active ? "bg-white/20 text-cream" : "bg-forest/10 text-forest"
                  )}
                >
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
