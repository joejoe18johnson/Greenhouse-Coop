"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATALOG_PDF_FILENAME, CATALOG_PDF_PATH } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function DownloadCatalogButton({
  variant = "default",
  className,
}: {
  variant?: "default" | "outline" | "cream" | "ghost";
  className?: string;
}) {
  return (
    <Button variant={variant} className={cn(className)} asChild>
      <a href={CATALOG_PDF_PATH} download={CATALOG_PDF_FILENAME}>
        <Download className="h-4 w-4" />
        Download catalog
      </a>
    </Button>
  );
}

export function ViewCatalogPdfButton({
  variant = "outline",
  className,
}: {
  variant?: "default" | "outline" | "cream" | "ghost";
  className?: string;
}) {
  return (
    <Button variant={variant} className={cn(className)} asChild>
      <a href="/catalog/download">
        <Download className="h-4 w-4" />
        View printable catalog
      </a>
    </Button>
  );
}
