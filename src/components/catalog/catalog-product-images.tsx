import Image from "next/image";
import { cn } from "@/lib/utils";
import { mainPlantImage } from "@/lib/product-images";
import type { Product } from "@/types";

function CatalogImage({
  src,
  alt,
  label,
  dimmed,
}: {
  src: string;
  alt: string;
  label: string;
  dimmed?: boolean;
}) {
  return (
    <figure className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 sm:w-24">
      <div className="relative h-[4.5rem] w-full sm:h-24">
        <Image
          src={src}
          alt={alt}
          fill
          className={cn("object-contain", dimmed && "opacity-55 saturate-50")}
          sizes="96px"
        />
      </div>
      <figcaption className="text-[10px] text-ink/45">{label}</figcaption>
    </figure>
  );
}

export function CatalogProductImages({
  product,
  className,
  dimmed = false,
}: {
  product: Product;
  className?: string;
  dimmed?: boolean;
}) {
  return (
    <div className={cn("flex shrink-0 gap-2", className)}>
      <CatalogImage
        src={product.fruitImage}
        alt={`${product.name} fruit`}
        label="Fruit"
        dimmed={dimmed}
      />
      <CatalogImage
        src={mainPlantImage(product)}
        alt={`${product.name} tree size`}
        label="Tree size"
        dimmed={dimmed}
      />
    </div>
  );
}
