/** Set true when hover tree images are ready in public/products/hover-images/ */
export const HOVER_TREE_IMAGES_ENABLED = false;

/** Hover/tree image lives in public/products/hover-images/, prefixed with "hover-". */
export function hoverImagePath(fruitImage: string): string {
  const fileName = fruitImage.split("/").pop() ?? "";
  return `/products/hover-images/hover-${fileName}`;
}
