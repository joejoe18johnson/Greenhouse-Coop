/** Set true when hover tree images are ready in public/products/hover-images/ */
export const HOVER_TREE_IMAGES_ENABLED = true;

export const HOVER_IMAGE_REFERENCE_NOTICE =
  "Photos are for visual reference only. Actual nursery stock may differ in size and shape.";

/** Filename slug overrides when hover file name differs from product id */
const HOVER_ID_ALIASES: Record<string, string> = {
  "pink-eurica-lemon": "pink-eureka-lemon",
  "tahiti-lime": "tahiti-lime",
};

/** Shared hover files keyed by category or custom slug */
const HOVER_SHARED_FILES: Record<string, string> = {
  Avocado: "avocados-hover-image.png",
};

/** Hover/tree image in public/products/hover-images/ */
export function hoverImagePath(
  productId: string,
  options?: { category?: string; fruitImage?: string }
): string {
  if (options?.category && HOVER_SHARED_FILES[options.category]) {
    return `/products/hover-images/${HOVER_SHARED_FILES[options.category]}`;
  }

  const slug = HOVER_ID_ALIASES[productId] ?? productId;
  return `/products/hover-images/${slug}-hover-image.png`;
}

/** Legacy naming: hover-{fruitImageFileName} — used as fallback in FruitPlantSwap */
export function legacyHoverImagePath(fruitImage: string): string {
  const fileName = fruitImage.split("/").pop() ?? "";
  return `/products/hover-images/hover-${fileName}`;
}
