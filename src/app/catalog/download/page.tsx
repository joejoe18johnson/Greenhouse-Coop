"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { CatalogDocument } from "@/components/catalog/catalog-document";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";

function CatalogDownloadContent() {
  const products = useProducts();
  const searchParams = useSearchParams();
  const autoPrint = searchParams.get("print") === "1";

  useEffect(() => {
    if (!autoPrint || products.length === 0) return;
    const timer = window.setTimeout(() => window.print(), 800);
    return () => window.clearTimeout(timer);
  }, [autoPrint, products.length]);

  return (
    <div className="min-h-screen bg-cream print:bg-white">
      <div className="print-hidden sticky top-0 z-50 border-b border-forest/10 bg-cream/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[8.5in] flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/catalog">
              <ArrowLeft className="h-4 w-4" />
              Back to catalog
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
            <Button size="sm" asChild>
              <a href="/catalog/greenhouse-coop-catalog.pdf" download="greenhouse-coop-catalog.pdf">
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[8.5in] px-4 py-8 print:max-w-none print:p-0">
        <CatalogDocument products={products} />
      </div>
    </div>
  );
}

export default function CatalogDownloadPage() {
  return (
    <Suspense fallback={<div className="px-6 py-24 text-center text-ink/50">Preparing catalog…</div>}>
      <CatalogDownloadContent />
    </Suspense>
  );
}
