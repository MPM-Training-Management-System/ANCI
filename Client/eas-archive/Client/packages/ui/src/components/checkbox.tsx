"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@repo/lib";

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {}

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ className, checked, ...props }, ref) => {
  return (
    <label
      className={cn(
        "relative inline-flex cursor-pointer items-center",
        className
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        className="peer sr-only"
        {...props}
      />

      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded border border-input bg-background transition-all",
          "peer-checked:border-primary peer-checked:bg-primary"
        )}
      >
        <Check
          className="h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </div>
    </label>
  );
});

Checkbox.displayName = "Checkbox";