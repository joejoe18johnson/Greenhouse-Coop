/** Hover/tree image lives in public/products/hover-images/, prefixed with "hover-". */
export function hoverImagePath(fruitImage: string): string {
  const fileName = fruitImage.split("/").pop() ?? "";
  return `/products/hover-images/hover-${fileName}`;
}
