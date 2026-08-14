import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconBubble({
  icon: Icon,
  className,
  iconClassName,
  size = "md",
}: {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
}) {
  const box = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" }[size];
  const glyph = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" }[size];

  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full bg-forest/10 text-forest",
        box,
        className
      )}
    >
      <Icon className={cn(glyph, iconClassName)} />
    </span>
  );
}
