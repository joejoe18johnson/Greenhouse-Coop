"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { BankAccount } from "@/types";
import { cn } from "@/lib/utils";

function CopyableField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-2.5">
      <p className="text-[11px] font-medium text-ink/45">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p
          className={cn(
            "min-w-0 flex-1 break-all keep-case",
            mono ? "font-mono text-sm" : "text-sm text-ink/85"
          )}
        >
          {value}
        </p>
        <button
          type="button"
          onClick={copy}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-forest/15 bg-white text-forest transition hover:bg-forest/5 active:scale-95"
          aria-label={copied ? `${label} copied` : `Copy ${label}`}
        >
          {copied ? <Check className="h-4 w-4 text-leaf" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      {copied && <p className="mt-1 text-[11px] text-leaf">Copied</p>}
    </div>
  );
}

export function BankAccountCard({ account }: { account: BankAccount }) {
  return (
    <div className="rounded-2xl bg-cream p-4 text-sm">
      <p className="font-semibold text-forest">{account.bankName}</p>
      <CopyableField label="Account name" value={account.accountName} />
      <CopyableField label="Account number" value={account.accountNumber} mono />
    </div>
  );
}
