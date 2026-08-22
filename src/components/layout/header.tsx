"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogIn, LogOut, Menu, ShoppingBag, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NavSearch } from "@/components/layout/nav-search";
import { AdminNotificationBell, AdminNotificationBellLink } from "@/components/notifications/admin-notification-bell";
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
    mobile
      ? "gap-3 rounded-2xl px-3 py-2.5 text-base font-medium"
      : "relative gap-1.5 pb-1 text-sm font-medium",
    mobile && (active ? "bg-forest/10 text-forest" : "text-forest/85 hover:bg-forest/5"),
    !mobile &&
      (active
        ? cn(
            "font-semibold text-forest",
            "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-forest"
          )
        : "text-ink/70 hover:text-forest")
  );
}

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { session, user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdminArea = pathname.startsWith("/admin");

  const isAdmin = session?.role === "admin" && user;
  const isCustomer = session?.role === "customer" && user;
  const accountHref = session ? (session.role === "admin" ? "/admin" : "/dashboard") : "/login";

  if (isAdminArea) return null;

  async function signOut() {
    await logout();
    setOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-[max(1rem,env(safe-area-inset-top))] print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-full glass px-3 py-2 sm:px-4 md:px-6">
        <Link href="/" className="flex min-w-0 shrink items-center">
          <Logo variant="horizontal" iconSize={42} wordmarkVisibility="always" priority />
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

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <NavSearch className="hidden w-44 md:block lg:w-56" />
          {isAdmin && (
            <div className="hidden md:block">
              <AdminNotificationBell adminId={user.id} />
            </div>
          )}
          {isCustomer && (
            <div className="hidden md:block">
              <NotificationBell userId={user.id} />
            </div>
          )}
          {!session && (
            <Button variant="citrus" size="sm" className="hidden gap-1.5 md:inline-flex" asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" aria-label="Account" className="shrink-0" asChild>
            <Link href={accountHref}>
              <UserRound className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Cart" asChild className="relative shrink-0">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-citrus px-1 text-[10px] font-bold text-ink">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="inline-flex shrink-0 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" inset>
          <Link href="/" className="mb-6 block pr-10" onClick={() => setOpen(false)}>
            <Logo variant="horizontal" iconSize={40} wordmarkVisibility="always" />
          </Link>
          <NavSearch className="mb-4" onNavigate={() => setOpen(false)} />

          {session ? (
            <div className="mb-6 space-y-2">
              <Button variant="citrus" className="w-full gap-2" asChild>
                <Link href={accountHref} onClick={() => setOpen(false)}>
                  {isAdmin ? <LayoutDashboard className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                  {isAdmin ? "Admin dashboard" : "My account"}
                </Link>
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => void signOut()}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          ) : (
            <Button variant="citrus" className="mb-6 w-full gap-2" asChild>
              <Link href="/login" onClick={() => setOpen(false)}>
                <LogIn className="h-4 w-4" />
                Sign in / Log in
              </Link>
            </Button>
          )}

          <div className="flex flex-col gap-1">
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
            <Link
              href={accountHref}
              onClick={() => setOpen(false)}
              className={cn(
                "inline-flex items-center gap-3 rounded-2xl px-3 py-2.5 text-base font-medium",
                isNavActive(pathname, accountHref)
                  ? "bg-forest/10 font-semibold text-forest"
                  : "text-forest/85 hover:bg-forest/5"
              )}
            >
              <UserRound className="h-5 w-5" />
              {session ? (isAdmin ? "Admin" : "Dashboard") : "Sign in"}
            </Link>
            {isCustomer && (
              <NotificationBellLink userId={user.id} onNavigate={() => setOpen(false)} />
            )}
            {isAdmin && (
              <AdminNotificationBellLink adminId={user.id} onNavigate={() => setOpen(false)} />
            )}
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className={cn(
                "inline-flex items-center gap-3 rounded-2xl px-3 py-2.5 text-base font-medium",
                isNavActive(pathname, "/cart") ? "bg-forest/10 font-semibold text-forest" : "text-forest/85 hover:bg-forest/5"
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
