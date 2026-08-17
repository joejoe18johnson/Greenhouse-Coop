"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadInvoicePdf } from "@/lib/download-invoice-pdf";

export function DownloadInvoiceButton({
  targetId,
  filename,
  variant = "outline",
  className,
}: {
  targetId: string;
  filename: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onDownload() {
    const element = document.getElementById(targetId);
    if (!element) {
      setError("Invoice not found.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await downloadInvoicePdf(element, filename);
    } catch {
      setError("Could not download invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button variant={variant} onClick={onDownload} disabled={loading}>
        <Download className="h-4 w-4" />
        {loading ? "Preparing…" : "Download invoice"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
