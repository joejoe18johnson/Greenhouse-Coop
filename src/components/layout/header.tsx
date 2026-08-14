"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { NavSearch } from "@/components/layout/nav-search";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { NAV_LINKS } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { session, user } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdminArea = pathname.startsWith("/admin");

  if (isAdminArea) return null;

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full glass px-4 py-2 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logos/logo-icon.png"
            alt="Greenhouse Co-Op"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
          <span className="hidden sm:block">
            <span className="block font-semibold leading-none text-forest">GreenHouse</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink/50">co-operative</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium text-ink/70 transition hover:text-forest",
                pathname === link.href && "text-forest"
              )}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavSearch className="hidden w-44 md:block lg:w-56" />
          <Link href={session ? (session.role === "admin" ? "/admin" : "/dashboard") : "/login"}>
            <Button variant="ghost" size="icon" aria-label="Account">
              <UserRound className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
            </Button>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-citrus px-1 text-[10px] font-bold text-ink">
                {count}
              </span>
            )}
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <Link href="/" className="mb-8 flex items-center gap-2" onClick={() => setOpen(false)}>
            <Image src="/logos/logo-icon.png" alt="" width={40} height={40} />
            <span className="font-semibold text-forest">GreenHouse co-operative</span>
          </Link>
          <NavSearch className="mb-6" onNavigate={() => setOpen(false)} />
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-3 text-lg font-medium text-forest"
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
            <Link href={user ? "/dashboard" : "/login"} onClick={() => setOpen(false)} className="inline-flex items-center gap-3 text-lg font-medium">
              <UserRound className="h-5 w-5" />
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
