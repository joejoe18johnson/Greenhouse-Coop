"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { propagationInfo } from "@/lib/propagation";
import type { PropagationType } from "@/types";

function PropagationInfoBody({ info }: { info: ReturnType<typeof propagationInfo> }) {
  return (
    <>
      <p className="mt-2 text-sm leading-relaxed text-ink/65">{info.summary}</p>
      <ul className="mt-4 space-y-3">
        {info.benefits.map((benefit) => (
          <li key={benefit.title} className="text-sm leading-relaxed text-ink/75">
            <span className="font-semibold text-forest">{benefit.title}:</span> {benefit.text}
          </li>
        ))}
      </ul>
    </>
  );
}

export function PropagationBadge({ type }: { type: PropagationType | string }) {
  const [open, setOpen] = useState(false);
  const info = propagationInfo(type);

  return (
    <>
      <Badge className="gap-1.5 pr-2">
        {info.label}
        <button
          type="button"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-forest/15 text-forest transition hover:bg-forest/25"
          aria-label={`About ${info.title}`}
          aria-expanded={open}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(true);
          }}
        >
          <Info className="h-2.5 w-2.5" />
        </button>
      </Badge>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogTitle className="font-display text-2xl text-forest-dark">{info.title}</DialogTitle>
          <DialogDescription className="sr-only">
            How {info.title.toLowerCase()} propagation works and why it helps your garden.
          </DialogDescription>
          <PropagationInfoBody info={info} />
        </DialogContent>
      </Dialog>
    </>
  );
}
