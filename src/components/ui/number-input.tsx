"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  formatNumericDisplay,
  parseNumericValue,
  sanitizeNumericTyping,
} from "@/lib/number-input";

type NumberInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode"
> & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  allowDecimal?: boolean;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, min = 0, allowDecimal = false, className, onFocus, onBlur, ...props }, ref) => {
    const [text, setText] = useState(() => formatNumericDisplay(value, allowDecimal));
    const focusedRef = useRef(false);

    useEffect(() => {
      if (!focusedRef.current) {
        setText(formatNumericDisplay(value, allowDecimal));
      }
    }, [value, allowDecimal]);

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        className={cn(className)}
        value={text}
        onFocus={(event) => {
          focusedRef.current = true;
          setText(value === 0 ? "" : formatNumericDisplay(value, allowDecimal));
          event.target.select();
          onFocus?.(event);
        }}
        onBlur={(event) => {
          focusedRef.current = false;
          const parsed = Math.max(min, parseNumericValue(text, min));
          onChange(parsed);
          setText(formatNumericDisplay(parsed, allowDecimal));
          onBlur?.(event);
        }}
        onChange={(event) => {
          const next = sanitizeNumericTyping(event.target.value, allowDecimal);
          setText(next);
          if (next !== "" && next !== ".") {
            onChange(Math.max(min, parseNumericValue(next, min)));
          }
        }}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";
