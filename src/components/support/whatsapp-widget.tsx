"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleHelp, MessageCircle, X, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/support/whatsapp-icon";
import { CHAT_FAQS, whatsappLink } from "@/data/faq";
import { FAQ_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function WhatsAppWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="w-[min(92vw,360px)] overflow-hidden rounded-[28px] border border-white/60 bg-cream shadow-float"
          >
            <div className="bg-forest px-5 py-4 text-cream">
              <p className="text-xs text-lime-bright">Support</p>
              <h3 className="mt-1 font-display text-2xl">How can we help?</h3>
              <p className="mt-1 text-sm text-cream/75">Quick answers, or chat with us on WhatsApp.</p>
            </div>

            <div className="space-y-2 p-4">
              {CHAT_FAQS.map((faq) => {
                const expanded = active === faq.id;
                const Icon = FAQ_ICONS[faq.id] ?? CircleHelp;
                return (
                  <div key={faq.id} className="overflow-hidden rounded-2xl bg-white">
                    <button
                      type="button"
                      onClick={() => setActive(expanded ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-forest"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-leaf" />
                        {faq.question}
                      </span>
                      <ChevronRight className={cn("h-4 w-4 shrink-0 transition", expanded && "rotate-90")} />
                    </button>
                    <AnimatePresence>
                      {expanded && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-3 text-sm leading-relaxed text-ink/65"
                        >
                          {faq.answer}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-forest/10 p-4">
              <a
                href={whatsappLink("Hello Greenhouse Co-Op, I have another question.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe5d]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                I have another question
              </a>
              <p className="mt-2 text-center text-[11px] text-ink/40">Opens WhatsApp chat</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat support"}
        onClick={() => setOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-float transition hover:scale-105 hover:bg-[#1ebe5d]"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
