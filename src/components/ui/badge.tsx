import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-forest/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest",
        className
      )}
      {...props}
    />
  );
}
