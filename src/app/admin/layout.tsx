"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Banknote,
  BarChart3,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  LogOut,
  Sprout,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAdminCounts } from "@/hooks/use-admin-counts";
import { AdminBackendNotice } from "@/components/admin/backend-notice";
import { AdminStockWaitPanel } from "@/components/admin/stock-wait-panel";
import { AdminPushNotificationPrompt } from "@/components/admin/push-notification-prompt";
import { AdminNotificationBell } from "@/components/notifications/admin-notification-bell";
import { AdminNotificationToasts } from "@/components/notifications/admin-notification-toasts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const links: { href: string; label: string; icon: LucideIcon; countKey?: "overview" | "orders" | "payments" | "products" | "requests" }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, countKey: "overview" },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, countKey: "orders" },
  { href: "/admin/payments", label: "Payments", icon: Banknote, countKey: "payments" },
  { href: "/admin/financials", label: "Financials", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Sprout, countKey: "products" },
  { href: "/admin/requests", label: "Customer requests", icon: Inbox, countKey: "requests" },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/couriers", label: "Couriers", icon: Warehouse },
];

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-citrus px-1.5 py-0.5 text-[10px] font-semibold leading-none text-forest-dark">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function AdminNavLink({
  link,
  active,
  count,
  compact = false,
}: {
  link: (typeof links)[number];
  active: boolean;
  count: number;
  compact?: boolean;
}) {
  return (
    <Link
      href={link.href}
      className={cn(
        compact
          ? "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2.5 text-xs font-medium whitespace-nowrap"
          : "inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm",
        compact
          ? active
            ? "bg-forest text-cream"
            : "bg-forest/10 text-forest"
          : active
            ? "bg-white/10 text-cream"
            : "text-cream/70 hover:bg-white/10 hover:text-cream"
      )}
    >
      <link.icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {link.label}
      <NavBadge count={count} />
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const counts = useAdminCounts();

  useEffect(() => {
    if (!ready) return;
    if (!user || user.role !== "admin") router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "admin") {
    return <div className="px-6 py-24 text-center text-ink/50">Checking admin access…</div>;
  }

  function badgeCount(link: (typeof links)[number]) {
    if (!link.countKey) return 0;
    return counts[link.countKey];
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-forest-deep text-cream">
      <div className="mx-auto flex max-w-7xl gap-0 md:gap-8">
        <aside className="hidden w-64 shrink-0 px-2 py-10 print:hidden md:block">
          <div className="flex items-center justify-between gap-2 px-4">
            <Link href="/" className="text-base font-semibold tracking-tight">
              GreenHouse Admin
            </Link>
            <AdminNotificationBell adminId={user.id} />
          </div>
          <nav className="mt-12 flex flex-col gap-2">
            {links.map((link) => (
              <AdminNavLink
                key={link.href}
                link={link}
                active={pathname === link.href}
                count={badgeCount(link)}
              />
            ))}
            <Button
              variant="citrus"
              className="mt-10 w-full justify-start gap-3 px-4"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </nav>
        </aside>
        <div className="min-h-screen min-w-0 flex-1 overflow-x-hidden bg-cream p-4 text-ink print:m-0 print:bg-white print:p-0 md:my-6 md:rounded-[32px] md:p-8 print:md:my-0 print:md:rounded-none">
          <div className="mb-4 flex items-center justify-between gap-3 print:hidden md:hidden">
            <Link href="/admin" className="min-w-0 truncate text-sm font-semibold text-forest">
              GreenHouse Admin
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <AdminNotificationBell adminId={user.id} />
              <Button
              type="button"
              variant="citrus"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
            </div>
          </div>
          <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] print:hidden md:hidden [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <AdminNavLink
                key={link.href}
                link={link}
                active={pathname === link.href}
                count={badgeCount(link)}
                compact
              />
            ))}
          </nav>
          <AdminBackendNotice />
          <AdminPushNotificationPrompt adminId={user.id} />
          {children}
        </div>
      </div>
      <AdminNotificationToasts adminId={user.id} />
      <AdminStockWaitPanel />
    </div>
  );
}
