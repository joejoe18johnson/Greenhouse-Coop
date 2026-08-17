"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <a href="/catalog/greenhouse-coop-catalog.pdf" download="greenhouse-coop-catalog.pdf">
        <Download className="h-4 w-4" />
        Download Catalog
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
