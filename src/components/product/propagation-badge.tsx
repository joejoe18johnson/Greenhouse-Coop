"use client";

import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { propagationInfo } from "@/lib/propagation";
import type { PropagationType } from "@/types";

export function PropagationBadge({ type }: { type: PropagationType | string }) {
  const info = propagationInfo(type);

  return (
    <Badge className="gap-1.5 pr-2">
      {info.label}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-forest/15 text-forest transition hover:bg-forest/25"
            aria-label={`About ${info.title}`}
          >
            <Info className="h-2.5 w-2.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-0">
          <div className="border-b border-forest/10 px-4 py-3">
            <p className="font-semibold text-forest-dark">{info.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink/65">{info.summary}</p>
          </div>
          <ul className="space-y-2 px-4 py-3">
            {info.benefits.map((benefit) => (
              <li key={benefit.title} className="text-xs leading-relaxed text-ink/75">
                <span className="font-semibold text-forest">{benefit.title}:</span> {benefit.text}
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </Badge>
  );
}
