"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { HOVER_TREE_IMAGES_ENABLED, hoverImagePath } from "@/lib/product-images";
import { cn } from "@/lib/utils";

export function FruitPlantSwap({
  fruitImage,
  plantImage,
  alt,
  className,
  sizes = "(min-width: 768px) 320px, 70vw",
  priority = false,
  forceView,
}: {
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
  const hoverImage = hoverImagePath(fruitImage);
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
      className={cn("relative isolate cursor-pointer select-none", className)}
      onMouseEnter={() => !forceView && !isTouch && setShowPlant(true)}
      onMouseLeave={() => !forceView && !isTouch && setShowPlant(false)}
      onClick={() => !forceView && isTouch && setShowPlant((v) => !v)}
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
            onError={() => {
              setTreeImage((current) => (current !== plantImage ? plantImage : current));
            }}
          />
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold text-forest backdrop-blur">
        {showPlant ? "Tree size" : "Fruit"}
      </div>
    </div>
  );
}
