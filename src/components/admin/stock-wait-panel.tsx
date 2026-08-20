"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellRing, Check, ChevronRight, Phone, Sprout, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStockWaitRequests } from "@/hooks/use-stock-wait-requests";
import { setStockWaitRequestStatus } from "@/lib/store";
import {
  formatStockWaitPhone,
  stockWaitTelHref,
  stockWaitWhatsAppHref,
} from "@/lib/stock-wait-requests";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/support/whatsapp-icon";

const DISMISS_KEY = "adminStockWaitPanelCollapsed";

export function AdminStockWaitPanel() {
  const { pending, refresh } = useStockWaitRequests();
  const [collapsed, setCollapsed] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  function toggleCollapsed(next: boolean) {
    setCollapsed(next);
    window.localStorage.setItem(DISMISS_KEY, next ? "1" : "0");
  }

  async function markStatus(id: string, status: "fulfilled" | "dismissed") {
    setUpdatingId(id);
    try {
      await setStockWaitRequestStatus(id, status);
      await refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  if (!pending.length) return null;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => toggleCollapsed(false)}
        className="fixed right-0 top-28 z-[55] flex items-center gap-2 rounded-l-2xl border border-r-0 border-forest/15 bg-citrus px-3 py-3 pr-2 text-sm font-semibold text-forest shadow-float print:hidden"
        aria-label={`Show ${pending.length} stock waitlist reminders`}
      >
        <BellRing className="h-4 w-4" />
        <span className="tabular-nums">{pending.length}</span>
        <ChevronRight className="h-4 w-4 rotate-180" />
      </button>
    );
  }

  return (
    <aside
      className="fixed right-4 top-20 z-[55] flex w-[min(100vw-2rem,22rem)] max-h-[min(70vh,640px)] flex-col overflow-hidden rounded-[24px] border border-forest/10 bg-white shadow-float print:hidden"
      aria-label="Clients waiting for out-of-stock products"
    >
      <div className="flex items-start justify-between gap-3 border-b border-forest/10 bg-citrus/25 px-4 py-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-forest">
            <BellRing className="h-4 w-4" />
            Waiting for stock
          </p>
          <p className="mt-0.5 text-xs text-ink/55">
            {pending.length} client{pending.length === 1 ? "" : "s"} want trees not currently available
          </p>
        </div>
        <button
          type="button"
          aria-label="Collapse waitlist panel"
          onClick={() => toggleCollapsed(true)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/45 transition hover:bg-forest/5 hover:text-forest"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="flex-1 space-y-3 overflow-y-auto p-3">
        {pending.map((entry) => (
          <li
            key={entry.id}
            className="rounded-2xl border border-forest/10 bg-cream/40 p-3 text-sm"
          >
            <p className="font-semibold text-forest-dark">{entry.customerName}</p>
            <a
              href={stockWaitTelHref(entry.phone)}
              className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-forest keep-case"
            >
              <Phone className="h-3.5 w-3.5" />
              {formatStockWaitPhone(entry.phone)}
            </a>
            <p className="mt-2 flex items-start gap-2 text-ink/75">
              <Sprout className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" />
              <span>
                Waiting for <strong className="text-forest">{entry.productName}</strong>
              </span>
            </p>
            {entry.notes && (
              <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-xs text-ink/65">{entry.notes}</p>
            )}
            <p className="mt-2 text-[11px] text-ink/40">
              {new Date(entry.createdAt).toLocaleString("en-BZ", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={stockWaitWhatsAppHref(entry.phone, entry.productName)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                WhatsApp
              </a>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1 px-3 text-xs"
                disabled={updatingId === entry.id}
                onClick={() => markStatus(entry.id, "fulfilled")}
              >
                <Check className="h-3.5 w-3.5" />
                Notified
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-xs text-ink/55"
                disabled={updatingId === entry.id}
                onClick={() => markStatus(entry.id, "dismissed")}
              >
                Dismiss
              </Button>
            </div>
            <Link
              href={`/product/${entry.productId}`}
              className={cn("mt-2 inline-block text-xs font-medium text-forest underline")}
            >
              View product
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
