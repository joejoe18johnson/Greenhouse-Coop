import { BRAND } from "@/lib/constants";

export const FAQS = [
  {
    id: "payment",
    question: "How do I pay for my trees?",
    answer:
      "Place the order first to get a 6-character reference such as A7B2K9. Pay a 50% deposit to secure your order — include that reference in your bank transfer notes, then send your deposit screenshot to us on WhatsApp with the same reference. The remaining balance is due when you collect your trees.",
  },
  {
    id: "delivery",
    question: "Do you deliver outside Belmopan?",
    answer: "",
  },
  {
    id: "stock",
    question: "What if a tree is out of stock?",
    answer:
      "Availability follows the season and nursery stock. If an item becomes unavailable after you order, we will contact you with an alternative or issue a full refund for that item. Some trees may take 6–8 weeks if they are still finishing in the nursery.",
  },
  {
    id: "cart-hold",
    question: "How long do items stay in my cart?",
    answer:
      "Items in your cart are held for 72 hours from the last time you change the cart. After 3 days the cart resets, so place your order before then.",
  },
  {
    id: "account",
    question: "Do I need an account to order?",
    answer:
      "Yes. An account lets us match your payment, delivery address, invoices, and order tracking. Create one before checkout with your name, email, phone, and password.",
  },
  {
    id: "size",
    question: "What size are the trees?",
    answer:
      "Most grafted citrus and avocado trees ship around 2–3 ft. Mangoes are often 3–4 ft. Check the listed size on each product card.",
  },
  {
    id: "courier-shipping",
    question: "How does courier shipping work?",
    answer:
      "For areas outside local delivery, we ship through companies such as IDS and EZY Courier. You pay shipping directly at their office when you collect — not on your Greenhouse Co-Op order. Message us on WhatsApp with your town and order details to get a shipping quote.",
  },
];

export const CHAT_FAQS = FAQS.slice(0, 3);

export function whatsappLink(message?: string) {
  const text =
    message ??
    "Hello Greenhouse Co-Op, I have a question about fruit trees.";
  const number = BRAND.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function whatsappShippingQuoteLink(town?: string, district?: string) {
  const place =
    town?.trim() && district?.trim()
      ? `${town.trim()}, ${district.trim()}`
      : town?.trim() || district?.trim() || "my area";
  return whatsappLink(
    `Hello Greenhouse Co-Op, I'd like a shipping quote for my order to ${place}.`
  );
}

export function whatsappPaymentLink(reference: string, amount: string, kind: "deposit" | "balance" | "full" = "deposit") {
  const label =
    kind === "full" ? "Full payment" : kind === "balance" ? "Balance" : "Deposit (50%)";
  return whatsappLink(
    `Hello Greenhouse Co-Op, here is my proof of payment.\nReference: ${reference}\n${label}: ${amount}`
  );
}
