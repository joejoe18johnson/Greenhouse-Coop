"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Apple, TreeDeciduous } from "lucide-react";
import { HOVER_TREE_IMAGES_ENABLED, hoverImagePath, legacyHoverImagePath } from "@/lib/product-images";
import { cn } from "@/lib/utils";

type ImageView = "fruit" | "plant";

function ViewToggle({
  view,
  onChange,
  compact = false,
}: {
  view: ImageView;
  onChange: (view: ImageView) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn("flex justify-center gap-1", compact ? "mt-2" : "mt-3")}
      role="tablist"
      aria-label="Product photo view"
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === "fruit"}
        onClick={() => onChange("fruit")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold transition",
          compact ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
          view === "fruit"
            ? "bg-forest text-cream shadow-sm"
            : "bg-white/80 text-forest ring-1 ring-forest/15 hover:bg-forest/5"
        )}
      >
        <Apple className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        Fruit
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "plant"}
        onClick={() => onChange("plant")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-semibold transition",
          compact ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs",
          view === "plant"
            ? "bg-forest text-cream shadow-sm"
            : "bg-white/80 text-forest ring-1 ring-forest/15 hover:bg-forest/5"
        )}
      >
        <TreeDeciduous className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        Tree size
      </button>
    </div>
  );
}

export function FruitPlantSwap({
  productId,
  category,
  fruitImage,
  plantImage,
  alt,
  className,
  sizes = "(min-width: 768px) 320px, 70vw",
  priority = false,
  forceView,
  onViewChange,
  variant = "toggle",
  compactToggle = false,
}: {
  productId: string;
  category?: string;
  fruitImage: string;
  plantImage: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  forceView?: ImageView;
  onViewChange?: (view: ImageView) => void;
  variant?: "toggle" | "hover";
  compactToggle?: boolean;
}) {
  const [internalView, setInternalView] = useState<ImageView>("fruit");
  const [isTouch, setIsTouch] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const hoverImage = hoverImagePath(productId, { category, fruitImage });
  const legacyHover = legacyHoverImagePath(fruitImage);
  const [treeImage, setTreeImage] = useState(hoverImage);
  const swapEnabled = HOVER_TREE_IMAGES_ENABLED;
  const isControlled = forceView !== undefined;
  const view = isControlled ? forceView : internalView;
  const showPlant = view === "plant";

  function setView(next: ImageView) {
    if (!isControlled) setInternalView(next);
    onViewChange?.(next);
  }

  useEffect(() => {
    if (!swapEnabled || variant !== "hover") return;
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, [swapEnabled, variant]);

  useEffect(() => {
    setTreeImage(hoverImage);
  }, [hoverImage, plantImage]);

  const handleTreeImageError = () => {
    setTreeImage((current) => {
      if (current === plantImage) return current;
      if (current === hoverImage && legacyHover !== hoverImage) return legacyHover;
      if (current === legacyHover || current === hoverImage) return plantImage;
      return plantImage;
    });
  };

  const image = (
    <AnimatePresence mode="wait">
      <motion.div
        key={showPlant ? "plant" : "fruit"}
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.97 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-full w-full"
      >
        <Image
          src={showPlant ? treeImage : fruitImage}
          alt={showPlant ? `${alt} tree size reference` : `${alt} fruit`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain drop-shadow-[0_24px_30px_rgba(45,106,79,0.28)]"
          onError={handleTreeImageError}
        />
      </motion.div>
    </AnimatePresence>
  );

  if (!swapEnabled) {
    return (
      <div className={cn("relative isolate", className)}>
        <Image
          src={fruitImage}
          alt={`${alt} fruit`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain drop-shadow-[0_24px_30px_rgba(45,106,79,0.28)]"
        />
      </div>
    );
  }

  if (variant === "hover") {
    return (
      <div
        className={cn("relative isolate cursor-pointer select-none [touch-action:manipulation]", className)}
        onMouseEnter={() => !isControlled && !isTouch && setView("plant")}
        onMouseLeave={() => !isControlled && !isTouch && setView("fruit")}
        onTouchStart={(e) => {
          if (isControlled || !isTouch) return;
          const t = e.touches[0];
          touchStart.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          if (isControlled || !isTouch || !touchStart.current) return;
          const t = e.changedTouches[0];
          const dx = Math.abs(t.clientX - touchStart.current.x);
          const dy = Math.abs(t.clientY - touchStart.current.y);
          touchStart.current = null;
          if (dx > 12 || dy > 12) return;
          setView(showPlant ? "fruit" : "plant");
        }}
      >
        {image}
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold text-forest backdrop-blur">
          {showPlant ? "Tree size" : "Fruit"}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="relative min-h-0 flex-1">{image}</div>
      {!isControlled && (
        <ViewToggle view={view} onChange={setView} compact={compactToggle} />
      )}
    </div>
  );
}

export { ViewToggle as FruitPlantViewToggle };
export type { ImageView as FruitPlantView };
