"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/shipping", label: "Shipping" },
  { href: "/admin/couriers", label: "Couriers" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "admin") router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "admin") {
    return <div className="px-6 py-24 text-center text-ink/50">Checking admin access…</div>;
  }

  return (
    <div className="min-h-screen bg-forest-deep text-cream">
      <div className="mx-auto flex max-w-7xl gap-0 md:gap-8">
        <aside className="hidden w-56 shrink-0 py-8 md:block">
          <Link href="/" className="px-4 text-sm font-semibold">GreenHouse Admin</Link>
          <nav className="mt-8 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm text-cream/70 hover:bg-white/10 hover:text-cream",
                  pathname === link.href && "bg-white/10 text-cream"
                )}
              >
                {link.label}
              </Link>
            ))}
            <button className="mt-6 rounded-full px-4 py-2 text-left text-sm text-cream/50" onClick={() => { logout(); router.push("/"); }}>
              Sign out
            </button>
          </nav>
        </aside>
        <div className="min-h-screen flex-1 bg-cream text-ink md:my-6 md:rounded-[32px] md:p-8 p-4">
          <div className="mb-6 flex flex-wrap gap-2 md:hidden">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full bg-forest/10 px-3 py-1 text-xs text-forest">
                {link.label}
              </Link>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
