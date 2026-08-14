"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQS, whatsappLink } from "@/data/faq";

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs uppercase tracking-[0.22em] text-leaf">Help</p>
      <h1 className="mt-2 font-display text-5xl text-forest-dark">Frequently asked questions</h1>
      <p className="mt-4 text-ink/65">
        Quick answers about ordering, delivery, and nursery stock. If you still need help, chat with us on WhatsApp.
      </p>

      <Accordion type="single" collapsible className="mt-10 rounded-[28px] bg-white/80 px-6">
        {FAQS.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-base text-forest-dark">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-base">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-10 rounded-[28px] bg-forest p-8 text-cream">
        <h2 className="font-display text-3xl">Still have a question?</h2>
        <p className="mt-3 text-cream/75">
          Message Greenhouse Co-Op on WhatsApp and we will help with varieties, delivery, or your order.
        </p>
        <Button variant="citrus" className="mt-6" asChild>
          <a href={whatsappLink()} target="_blank" rel="noreferrer">
            Chat on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
