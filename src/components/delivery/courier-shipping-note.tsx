import Link from "next/link";
import { MessageSquare, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/support/whatsapp-icon";
import { SHIPPING_COURIER_NOTICE } from "@/lib/constants";
import { whatsappShippingQuoteLink } from "@/data/faq";

export function CourierShippingNote({
  town,
  district,
  className = "",
}: {
  town?: string;
  district?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border border-citrus/30 bg-citrus/10 p-4 text-sm text-ink/75 ${className}`}
    >
      <Truck className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
      <div className="min-w-0 space-y-3">
        <p>{SHIPPING_COURIER_NOTICE}</p>
        <Link
          href={whatsappShippingQuoteLink(town, district)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1ebe5d]"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Ask about shipping on WhatsApp
        </Link>
        <p className="flex items-start gap-2 text-xs text-ink/50">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Tell us your town and what you are ordering — we will help you plan courier shipping.
        </p>
      </div>
    </div>
  );
}
