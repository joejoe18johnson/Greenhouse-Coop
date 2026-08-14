"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DownloadCatalogButton } from "@/components/catalog/download-catalog-button";
import { BRAND } from "@/lib/constants";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-24 border-t border-forest/10 bg-forest-deep text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <Image
            src="/logos/logo-white.png"
            alt={BRAND.name}
            width={220}
            height={90}
            className="mb-4 h-16 w-auto object-contain"
          />
          <p className="text-sm leading-relaxed text-cream/70">
            Grafted, air-layered, and seedling fruit trees grown for Belize gardens.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em]">Explore</h4>
          <div className="flex flex-col gap-2 text-sm text-cream/75">
            <Link href="/shop">Shop Trees</Link>
            <Link href="/catalog">Catalog</Link>
            <Link href="/delivery">Delivery</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em]">Visit</h4>
          <p className="text-sm leading-relaxed text-cream/75">
            {BRAND.location}
            <br />
            {BRAND.phone}
            <br />
            {BRAND.email}
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em]">Catalog</h4>
          <p className="mb-4 text-sm text-cream/75">
            Download the current variety guide and product catalog.
          </p>
          <DownloadCatalogButton variant="cream" />
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Greenhouse Co-Op. Grown in Belize.
      </div>
    </footer>
  );
}
