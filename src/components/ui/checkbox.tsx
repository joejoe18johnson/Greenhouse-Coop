import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink", className)}>
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-md border transition",
          checked ? "border-forest bg-forest text-cream" : "border-forest/25 bg-white"
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function Radio({
  checked,
  onChange,
  name,
  label,
  className,
}: {
  checked: boolean;
  onChange: () => void;
  name: string;
  label?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <span
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition",
          checked ? "border-forest bg-forest" : "border-forest/25 bg-white"
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-cream" />}
      </span>
      <input type="radio" name={name} className="sr-only" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
