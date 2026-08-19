"use client";

import { CircleHelp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/support/whatsapp-icon";
import { useFaqs } from "@/hooks/use-faqs";
import { whatsappLink } from "@/data/faq";
import { FAQ_ICONS } from "@/lib/icons";

export default function FaqPage() {
  const faqs = useFaqs();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs text-leaf">Help</p>
      <h1 className="page-title mt-2">Frequently asked questions</h1>
      <p className="mt-4 text-ink/65">
        Quick answers about ordering, delivery, and nursery stock. If you still need help, chat with us on WhatsApp.
      </p>

      <Accordion type="single" collapsible className="mt-10 rounded-[28px] bg-white/80 px-6">
        {faqs.map((faq) => {
          const Icon = FAQ_ICONS[faq.id] ?? CircleHelp;
          return (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-base text-forest-dark">
              <span className="flex items-center gap-3 pr-3">
                <Icon className="h-4 w-4 shrink-0 text-leaf" />
                {faq.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-base">{faq.answer}</AccordionContent>
          </AccordionItem>
          );
        })}
      </Accordion>

      <div className="mt-10 rounded-[28px] bg-forest p-8 text-cream">
        <h2 className="font-display text-3xl">Still have a question?</h2>
        <p className="mt-3 text-cream/75">
          Message Greenhouse Co-Op on WhatsApp and we will help with varieties, delivery, or your order.
        </p>
        <Button variant="citrus" className="mt-6" asChild>
          <a href={whatsappLink()} target="_blank" rel="noreferrer">
            <WhatsAppIcon className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
