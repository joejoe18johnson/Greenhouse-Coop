import { HOVER_IMAGE_REFERENCE_NOTICE } from "@/lib/product-images";
import { cn } from "@/lib/utils";

export function TreeImageReferenceNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-[11px] leading-relaxed text-ink/45", className)}>
      {HOVER_IMAGE_REFERENCE_NOTICE}
    </p>
  );
}
