"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StoreProvider } from "@/context/store-context";
import { WhatsAppWidget } from "@/components/support/whatsapp-widget";
import { usePathname } from "next/navigation";

function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <Header />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="min-h-[70vh]"
      >
        {children}
      </motion.main>
      <Footer />
      <WhatsAppWidget />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <PageShell>{children}</PageShell>
    </StoreProvider>
  );
}
