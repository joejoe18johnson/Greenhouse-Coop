"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Flame, Ruler, ShoppingBag } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FruitPlantSwap } from "@/components/product/fruit-plant-swap";
import { useCart } from "@/hooks/use-cart";
import { categoryIcon } from "@/lib/icons";
import { SHORT_SUPPLY_IDS } from "@/lib/constants";
import { formatBZD } from "@/lib/utils";
import type { Product } from "@/types";

function isAlwaysShort(product: Product) {
  return (SHORT_SUPPLY_IDS as readonly string[]).includes(product.id);
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const CategoryIcon = categoryIcon(product.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-[32px] border border-leaf/40 bg-white/80 shadow-card backdrop-blur-md"
    >
      {isAlwaysShort(product) && (
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-citrus px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink shadow-md">
          <Flame className="h-3.5 w-3.5" />
          Always short supply
        </span>
      )}
      <div className="relative mx-auto mt-4 h-56 w-56 md:h-64 md:w-64">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
          className="h-full w-full"
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
          {product.limitedSupply && !isAlwaysShort(product) && (
            <Badge className="bg-citrus/20 text-citrus">Limited</Badge>
          )}
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
            <AccordionTrigger className="py-2 text-xs uppercase tracking-[0.14em]">
              Flavor Profile
            </AccordionTrigger>
            <AccordionContent>{product.flavorProfile}</AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-3 flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => add(product.id)}>
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
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
