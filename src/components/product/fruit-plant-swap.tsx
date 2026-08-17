"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { HOVER_TREE_IMAGES_ENABLED, hoverImagePath, legacyHoverImagePath } from "@/lib/product-images";
import { cn } from "@/lib/utils";

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
}: {
  productId: string;
  category?: string;
  fruitImage: string;
  plantImage: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  forceView?: "fruit" | "plant";
}) {
  const [showPlant, setShowPlant] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const hoverImage = hoverImagePath(productId, { category, fruitImage });
  const legacyHover = legacyHoverImagePath(fruitImage);
  const [treeImage, setTreeImage] = useState(hoverImage);
  const swapEnabled = HOVER_TREE_IMAGES_ENABLED;

  useEffect(() => {
    if (!swapEnabled) return;
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, [swapEnabled]);

  useEffect(() => {
    if (!swapEnabled || !forceView) return;
    setShowPlant(forceView === "plant");
  }, [forceView, swapEnabled]);

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

  return (
    <div
      className={cn("relative isolate cursor-pointer select-none [touch-action:manipulation]", className)}
      onMouseEnter={() => !forceView && !isTouch && setShowPlant(true)}
      onMouseLeave={() => !forceView && !isTouch && setShowPlant(false)}
      onTouchStart={(e) => {
        if (forceView || !isTouch) return;
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        if (forceView || !isTouch || !touchStart.current) return;
        const t = e.changedTouches[0];
        const dx = Math.abs(t.clientX - touchStart.current.x);
        const dy = Math.abs(t.clientY - touchStart.current.y);
        touchStart.current = null;
        if (dx > 12 || dy > 12) return;
        setShowPlant((v) => !v);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={showPlant ? "plant" : "fruit"}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full w-full"
        >
          <Image
            src={showPlant ? treeImage : fruitImage}
            alt={showPlant ? `${alt} tree size` : `${alt} fruit`}
            fill
            sizes={sizes}
            priority={priority}
            className="object-contain drop-shadow-[0_24px_30px_rgba(45,106,79,0.28)]"
            onError={handleTreeImageError}
          />
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold text-forest backdrop-blur">
        {showPlant ? "Tree size" : "Fruit"}
      </div>
    </div>
  );
}
