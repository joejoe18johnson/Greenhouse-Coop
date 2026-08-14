"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FruitPlantSwap } from "@/components/product/fruit-plant-swap";
import { useCart } from "@/hooks/use-cart";
import { formatBZD } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-[32px] border border-leaf/40 bg-white/80 shadow-card backdrop-blur-md"
    >
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
          {product.limitedSupply && <Badge className="bg-citrus/20 text-citrus">Limited</Badge>}
        </div>
        <h3 className="font-display text-2xl text-forest-dark">{product.name}</h3>
        <p className="mt-1 text-sm text-ink/55">
          {product.category} · {product.size}
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
            Add to Cart
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/product/${product.id}`}>Details</Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
