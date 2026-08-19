"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Mail, MapPin, Phone } from "lucide-react";
import { DownloadCatalogButton } from "@/components/catalog/download-catalog-button";
import { BRAND } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/icons";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 border-t border-forest/10 bg-forest-deep text-cream md:mt-24 print:hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="footer" iconSize={48} className="mb-4" />
          <p className="text-sm leading-relaxed text-cream/70">
            Grafted, air-layered, and seedling fruit trees grown for Belize gardens.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold">Explore</h4>
          <div className="flex flex-col gap-2 text-sm text-cream/75">
            {NAV_LINKS.filter((l) => l.href !== "/").map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex items-center gap-2 hover:text-cream">
                <link.icon className="h-3.5 w-3.5" />
                {link.label === "Shop" ? "Shop Trees" : link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold">Visit</h4>
          <div className="space-y-3 text-sm leading-relaxed text-cream/75">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lime-bright" />
              {BRAND.location}
            </p>
            <p className="flex items-center gap-2 keep-case">
              <Phone className="h-4 w-4 shrink-0 text-lime-bright" />
              {BRAND.phone}
            </p>
            <p className="flex items-center gap-2 keep-case">
              <Mail className="h-4 w-4 shrink-0 text-lime-bright" />
              {BRAND.email}
            </p>
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold">Catalog</h4>
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
