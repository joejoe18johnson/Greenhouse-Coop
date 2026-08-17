/** Set true when hover tree images are ready in public/products/hover-images/ */
export const HOVER_TREE_IMAGES_ENABLED = true;

export const HOVER_IMAGE_REFERENCE_NOTICE =
  "All product photos are for visual reference only. Actual nursery stock may differ in size.";

const HOVER_GENERIC = "generic-hover.png";

/** Product-specific hover files (exceptions to shared/category rules) */
const HOVER_PRODUCT_FILES: Record<string, string> = {
  "pink-eurica-lemon": "pink-eureka-lemon-hover-image.png",
  "strawberry-deleez": "strawberry-hover-image.png",
  "peach-mexican": "peaches-hover-image.png",
  "mangosteen": "mangosteen-hover-image.png",
  "sweetsop-red": "sweet-sop-hover-image.png",
  "sweetsop-green": "sweet-sop-hover-image.png",
  papaya: "papaya-hover-image.png",
};

/** Shared hover files keyed by category */
const HOVER_CATEGORY_FILES: Record<string, string> = {
  Avocado: "avocados-hover-image.png",
  Coconut: "coconuts-hover-image.png",
  Mango: "mangoes-hover-image.png",
  Lemon: "lemons-hover-image.png",
  "Dragon Fruit": "dragon-fruit-hover-image.png",
  Soursop: "soursop-hover-image.png",
  Guava: "guava-hover-image.png",
};

/** All guava varieties share one hover image */
const HOVER_GUAVA_IDS = new Set([
  "pink-cuban-guava",
  "chinese-guava",
  "strawberry-guava",
  "yellow-spanish-guava",
]);

/** Mandarins, tangerines, grapefruits, and kumquat share one hover image */
const HOVER_MT_IDS = new Set([
  "king-mandarin",
  "dancy-mandarin",
  "jamaican-mandarin",
  "tangerine",
  "red-grapefruit",
  "white-grapefruit",
  "kumquat",
]);

/** Categories with dedicated per-product hover files: {id}-hover-image.png */
const HOVER_PER_PRODUCT_CATEGORIES = new Set(["Lime", "Orange"]);

/** Filename slug overrides when hover file name differs from product id */
const HOVER_ID_ALIASES: Record<string, string> = {
  "pink-eurica-lemon": "pink-eureka-lemon",
};

/** Hover/tree image in public/products/hover-images/ */
export function hoverImagePath(
  productId: string,
  options?: { category?: string; fruitImage?: string }
): string {
  if (HOVER_PRODUCT_FILES[productId]) {
    return `/products/hover-images/${HOVER_PRODUCT_FILES[productId]}`;
  }

  if (HOVER_GUAVA_IDS.has(productId)) {
    return `/products/hover-images/guava-hover-image.png`;
  }

  if (HOVER_MT_IDS.has(productId)) {
    return `/products/hover-images/mt-hover-image.png`;
  }

  const category = options?.category;
  if (category && HOVER_CATEGORY_FILES[category]) {
    return `/products/hover-images/${HOVER_CATEGORY_FILES[category]}`;
  }

  if (category && HOVER_PER_PRODUCT_CATEGORIES.has(category)) {
    const slug = HOVER_ID_ALIASES[productId] ?? productId;
    return `/products/hover-images/${slug}-hover-image.png`;
  }

  return `/products/hover-images/${HOVER_GENERIC}`;
}

/** Legacy naming: hover-{fruitImageFileName} — used as fallback in FruitPlantSwap */
export function legacyHoverImagePath(fruitImage: string): string {
  const fileName = fruitImage.split("/").pop() ?? "";
  return `/products/hover-images/hover-${fileName}`;
}

const MAIN_PLANT_BY_CATEGORY: Record<string, string> = {
  Avocado: "/products/avocado-plant.png",
  Mango: "/products/mango-plant.png",
  Orange: "/products/citrus-plant.png",
  Lime: "/products/citrus-plant.png",
  Lemon: "/products/citrus-plant.png",
  "Specialty Citrus": "/products/citrus-plant.png",
};

/** Main tree-size photo for catalog/print — never hover-image assets. */
export function mainPlantImage(product: {
  plantImage: string;
  category: string;
}): string {
  if (product.plantImage && !product.plantImage.includes("/hover-images/")) {
    return product.plantImage;
  }
  return MAIN_PLANT_BY_CATEGORY[product.category] ?? "/products/tropical-plant.png";
}
