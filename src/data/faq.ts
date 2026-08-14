import { BRAND } from "@/lib/constants";

export const FAQS = [
  {
    id: "payment",
    question: "How do I pay for my trees?",
    answer:
      "Place the order first to get a 6-character reference such as A7B2K9. Include that number in your bank transfer notes, then send your payment screenshot to us on WhatsApp with the same reference. Do not send proof before the order is placed.",
  },
  {
    id: "delivery",
    question: "Do you deliver outside Belmopan?",
    answer:
      "You can collect centrally at the Belmopan Bus Terminal if you do not want delivery. Local delivery is $10 BZD to Belmopan, Roaring Creek, and Camalote — free over $100 BZD. All other locations ship with IDS or EZY Courier. Couriers usually work office-to-office: collect at the courier office in your area, not at your door. Box size is calculated automatically from how many plants you order.",
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
      "Most grafted citrus and avocado trees ship around 2–3 ft. Mangoes are often 3–4 ft. Hover or tap a product image to see the current nursery tree, then check the listed size on the card.",
  },
  {
    id: "boxes",
    question: "How are shipping boxes chosen?",
    answer:
      "You do not pick a box. At checkout we recommend 1, 2, 3, or 4 sq.ft boxes from the number of plants in your cart. Local Belmopan-area deliveries include packing; courier orders add the box fee.",
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

export function whatsappPaymentLink(reference: string, total: string) {
  return whatsappLink(
    `Hello Greenhouse Co-Op, here is my proof of payment.\nReference: ${reference}\nAmount: ${total}`
  );
}
