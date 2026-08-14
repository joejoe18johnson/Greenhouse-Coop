import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-2xl border border-forest/15 bg-white/80 px-4 py-3 text-sm text-ink shadow-sm transition placeholder:text-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
