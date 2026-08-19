"use client";

import { useMemo } from "react";
import { FAQS } from "@/data/faq";
import { deliveryFaqAnswer } from "@/lib/shipping-copy";
import { useShippingSettings } from "@/hooks/use-shipping-settings";

export function useFaqs() {
  const shipping = useShippingSettings();

  return useMemo(
    () =>
      FAQS.map((faq) =>
        faq.id === "delivery" ? { ...faq, answer: deliveryFaqAnswer(shipping) } : faq
      ),
    [shipping]
  );
}

export function useChatFaqs() {
  const faqs = useFaqs();
  return useMemo(() => faqs.slice(0, 3), [faqs]);
}
