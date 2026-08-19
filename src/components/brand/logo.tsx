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
  showTagline = false,
  iconSize = 44,
  priority = false,
  wordmarkVisibility = "responsive",
}: {
  variant?: "horizontal" | "stacked" | "icon" | "wordmark" | "footer";
  className?: string;
  showTagline?: boolean;
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
  const taglineClass = variant === "footer" ? "text-cream/60" : "text-ink/50";
  const wordmarkHidden = wordmarkVisibility === "responsive" && variant !== "footer";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
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
        <GreenHouseWordmark size={iconSize >= 40 ? "md" : "sm"} tone={wordmarkTone} />
        {showTagline && (
          <span className={cn("mt-0.5 block text-[11px]", taglineClass)}>Co-Operative</span>
        )}
      </span>
    </span>
  );
}
