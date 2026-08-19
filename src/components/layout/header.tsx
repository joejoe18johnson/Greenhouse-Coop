"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, ShoppingBag, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NavSearch } from "@/components/layout/nav-search";
import { NotificationBell, NotificationBellLink } from "@/components/notifications/notification-bell";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { NAV_LINKS } from "@/lib/icons";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean, mobile = false) {
  return cn(
    "inline-flex items-center transition",
    mobile ? "gap-3 text-lg font-medium" : "relative gap-1.5 pb-1 text-sm font-medium",
    active
      ? cn(
          "font-semibold text-forest",
          !mobile &&
            "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-forest"
        )
      : cn("text-ink/70 hover:text-forest", mobile && "text-forest/80")
  );
}

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { session, user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdminArea = pathname.startsWith("/admin");

  const isCustomer = session?.role === "customer" && user;

  if (isAdminArea) return null;

  return (
    <header className="sticky top-0 z-40 px-4 pt-[max(1rem,env(safe-area-inset-top))] print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full glass px-4 py-2 md:px-6">
        <Link href="/" className="flex items-center">
          <Logo variant="horizontal" iconSize={44} wordmarkVisibility="always" priority />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} className={navLinkClass(active)}>
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <NavSearch className="hidden w-44 md:block lg:w-56" />
          {isCustomer && <NotificationBell userId={user.id} />}
          <Button variant="ghost" size="icon" aria-label="Account" asChild>
            <Link href={session ? (session.role === "admin" ? "/admin" : "/dashboard") : "/login"}>
              <UserRound className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Cart" asChild className="relative">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-citrus px-1 text-[10px] font-bold text-ink">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <Link href="/" className="mb-8 block" onClick={() => setOpen(false)}>
            <Logo variant="horizontal" iconSize={44} wordmarkVisibility="always" />
          </Link>
          <NavSearch className="mb-4" onNavigate={() => setOpen(false)} />
          {session && (
            <Button
              variant="citrus"
              className="mb-6 w-full"
              onClick={() => {
                logout();
                setOpen(false);
                router.push("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          )}
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => {
              const active = isNavActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={navLinkClass(active, true)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            <Link href={user ? "/dashboard" : "/login"} onClick={() => setOpen(false)} className="inline-flex items-center gap-3 text-lg font-medium">
              <UserRound className="h-5 w-5" />
              {user ? "Dashboard" : "Sign in"}
            </Link>
            {isCustomer && (
              <NotificationBellLink userId={user.id} onNavigate={() => setOpen(false)} />
            )}
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className={cn(
                "inline-flex items-center gap-3 text-lg font-medium",
                isNavActive(pathname, "/cart") ? "font-semibold text-forest" : "text-forest/80"
              )}
            >
              <span className="relative">
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-citrus px-1 text-[9px] font-bold text-ink">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>
              Cart
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
