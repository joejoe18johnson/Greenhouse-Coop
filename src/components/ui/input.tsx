import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-full border border-forest/15 bg-white/80 px-5 py-2 text-sm text-ink shadow-sm transition placeholder:text-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
