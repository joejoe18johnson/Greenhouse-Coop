"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Banknote,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Sprout,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: Banknote },
  { href: "/admin/products", label: "Products", icon: Sprout },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/couriers", label: "Couriers", icon: Warehouse },
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
    <div className="min-h-screen overflow-x-hidden bg-forest-deep text-cream">
      <div className="mx-auto flex max-w-7xl gap-0 md:gap-8">
        <aside className="hidden w-64 shrink-0 px-2 py-10 print:hidden md:block">
          <Link href="/" className="block px-4 text-base font-semibold tracking-tight">
            GreenHouse Admin
          </Link>
          <nav className="mt-12 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm text-cream/70 hover:bg-white/10 hover:text-cream",
                  pathname === link.href && "bg-white/10 text-cream"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <button
              className="mt-10 inline-flex items-center gap-3 rounded-full px-4 py-3 text-left text-sm text-cream/50 hover:bg-white/10 hover:text-cream"
              onClick={() => { logout(); router.push("/"); }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </aside>
        <div className="min-h-screen min-w-0 flex-1 overflow-x-hidden bg-cream p-4 text-ink print:m-0 print:bg-white print:p-0 md:my-6 md:rounded-[32px] md:p-8 print:md:my-0 print:md:rounded-none">
          <div className="mb-4 flex items-center justify-between gap-3 print:hidden md:hidden">
            <Link href="/admin" className="min-w-0 truncate text-sm font-semibold text-forest">
              GreenHouse Admin
            </Link>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-xs font-medium text-cream"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
          <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] print:hidden md:hidden [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-xs font-medium whitespace-nowrap",
                  pathname === link.href ? "bg-forest text-cream" : "bg-forest/10 text-forest"
                )}
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
