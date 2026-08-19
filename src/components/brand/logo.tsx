import Image from "next/image";
import { cn } from "@/lib/utils";

const WORDMARK_SIZE = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
} as const;

export function GreenHouseWordmark({
  className,
  size = "md",
  tone = "brand",
}: {
  className?: string;
  size?: keyof typeof WORDMARK_SIZE;
  tone?: "brand" | "light";
}) {
  const greenClass = tone === "light" ? "text-leaf-light" : "text-forest";
  const houseClass = tone === "light" ? "text-lime-bright" : "text-lime";

  return (
    <span className={cn("font-semibold leading-none tracking-tight keep-case", WORDMARK_SIZE[size], className)}>
      <span className={greenClass}>Green</span>
      <span className={houseClass}>House</span>
    </span>
  );
}

export function Logo({
  variant = "horizontal",
  className,
  iconSize = 44,
  priority = false,
  wordmarkVisibility = "responsive",
}: {
  variant?: "horizontal" | "stacked" | "icon" | "wordmark" | "footer";
  className?: string;
  iconSize?: number;
  priority?: boolean;
  wordmarkVisibility?: "responsive" | "always";
}) {
  if (variant === "stacked") {
    return (
      <Image
        src="/logos/logo-icon.png"
        alt="GreenHouse"
        width={Math.round(iconSize * 2.2)}
        height={Math.round(iconSize * 2.2)}
        className={cn("h-auto w-auto object-contain", className)}
        priority={priority}
      />
    );
  }

  if (variant === "icon") {
    return (
      <Image
        src="/logos/logo-mark.png"
        alt="GreenHouse"
        width={iconSize}
        height={iconSize}
        className={cn("object-contain", className)}
        priority={priority}
      />
    );
  }

  if (variant === "wordmark") {
    return <GreenHouseWordmark className={className} size={iconSize >= 40 ? "md" : "sm"} />;
  }

  const wordmarkTone = variant === "footer" ? "light" : "brand";
  const wordmarkHidden = wordmarkVisibility === "responsive" && variant !== "footer";
  const wordmarkSize = iconSize >= 44 ? "lg" : iconSize >= 36 ? "md" : "sm";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logos/logo-mark.png"
        alt=""
        width={iconSize}
        height={iconSize}
        className="shrink-0 object-contain"
        aria-hidden
        priority={priority}
      />
      <span className={cn(wordmarkHidden && "hidden sm:block")}>
        <GreenHouseWordmark size={wordmarkSize} tone={wordmarkTone} />
      </span>
    </span>
  );
}
