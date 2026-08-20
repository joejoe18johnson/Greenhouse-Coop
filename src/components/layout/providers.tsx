"use client";

import { motion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StoreProvider } from "@/context/store-context";
import { CustomerNotificationToasts } from "@/components/notifications/customer-notification-toasts";
import { AdminNotificationToasts } from "@/components/notifications/admin-notification-toasts";
import { StockWaitAlertToasts } from "@/components/notifications/stock-wait-alert-toasts";
import { WhatsAppWidget } from "@/components/support/whatsapp-widget";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

function GlobalToasts() {
  const { session, user } = useAuth();
  const pathname = usePathname();
  const isAdminArea = pathname.startsWith("/admin");

  return (
    <>
      <CustomerNotificationToasts />
      <StockWaitAlertToasts />
      {session?.role === "admin" && user && !isAdminArea && (
        <AdminNotificationToasts adminId={user.id} />
      )}
    </>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCatalogDownload = pathname === "/catalog/download";

  if (isCatalogDownload) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <motion.main
        key={pathname}
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="min-h-[70vh] fab-clearance"
      >
        {children}
      </motion.main>
      <Footer />
      <WhatsAppWidget />
      <GlobalToasts />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <TooltipProvider>
        <PageShell>{children}</PageShell>
      </TooltipProvider>
    </StoreProvider>
  );
}
