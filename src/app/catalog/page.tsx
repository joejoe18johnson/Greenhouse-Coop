"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadCatalogButton } from "@/components/catalog/download-catalog-button";

export default function CatalogPage() {
  async function share() {
    const url = `${window.location.origin}/catalog/greenhouse-coop-catalog.pdf`;
    if (navigator.share) {
      await navigator.share({
        title: "Greenhouse Co-Op Catalog",
        text: "Premium fruit trees for Belize gardens.",
        url,
      });
      return;
    }
    await navigator.clipboard.writeText(url);
    alert("Catalog link copied.");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-leaf">Catalog</p>
          <h1 className="mt-2 font-display text-5xl text-forest-dark">Variety guide</h1>
          <p className="mt-3 max-w-xl text-ink/65">
            The catalog is a product information guide — not live inventory. Availability can change with season and nursery stock.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <DownloadCatalogButton />
          <Button variant="outline" onClick={share}>
            <Share2 className="h-4 w-4" /> Share Catalog
          </Button>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-[28px] border border-forest/10 bg-white shadow-card">
        <iframe
          title="Greenhouse Co-Op Catalog"
          src="/catalog/greenhouse-coop-catalog.pdf"
          className="h-[80vh] w-full"
        />
      </div>
    </div>
  );
}
