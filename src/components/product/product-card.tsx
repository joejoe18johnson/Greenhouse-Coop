"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Ruler, ShoppingBag } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FruitPlantSwap } from "@/components/product/fruit-plant-swap";
import { ProductBadges } from "@/components/product/product-badges";
import { useCart } from "@/hooks/use-cart";
import { categoryIcon } from "@/lib/icons";
import { isInStock } from "@/lib/product-badges";
import { cn, formatBZD } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const CategoryIcon = categoryIcon(product.category);
  const available = isInStock(product);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={cn(
        "group relative overflow-hidden rounded-[32px] border bg-white/80 shadow-card backdrop-blur-md",
        available ? "border-leaf/40" : "border-red-300/80"
      )}
    >
      <ProductBadges product={product} overlay />
      <div className="relative mx-auto mt-4 h-56 w-56 md:h-64 md:w-64">
        {!available && (
          <div className="pointer-events-none absolute inset-0 z-[1] rounded-[24px] bg-white/45" aria-hidden />
        )}
        <motion.div
          animate={available ? { y: [0, -8, 0] } : { y: 0 }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
          className={cn("h-full w-full", !available && "opacity-60 saturate-50")}
        >
          <FruitPlantSwap
            fruitImage={product.fruitImage}
            plantImage={product.plantImage}
            alt={product.name}
            className="h-full w-full"
          />
        </motion.div>
      </div>

      <div className="px-5 pb-5 pt-2">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge>{product.propagationType}</Badge>
        </div>
        <h3 className="font-display text-2xl text-forest-dark">{product.name}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/55">
          <span className="inline-flex items-center gap-1">
            <CategoryIcon className="h-3.5 w-3.5 text-leaf" />
            {product.category}
          </span>
          <span className="inline-flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5 text-leaf" />
            {product.size}
          </span>
        </p>
        <p className="mt-1 text-[11px] text-ink/40">Hover or tap to see tree size</p>
        <p className="mt-3 font-semibold text-forest">{formatBZD(product.price)}</p>

        <Accordion type="single" collapsible className="mt-2">
          <AccordionItem value="flavor" className="border-none">
            <AccordionTrigger className="py-2 text-xs">
              Flavor Profile
            </AccordionTrigger>
            <AccordionContent>{product.flavorProfile}</AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-3 flex gap-2">
          <Button size="sm" className="flex-1" disabled={!available} onClick={() => add(product.id)}>
            <ShoppingBag className="h-3.5 w-3.5" />
            {available ? "Add to Cart" : "Out of Stock"}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/product/${product.id}`}>
              <Eye className="h-3.5 w-3.5" />
              Details
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
