"use client";

import * as React from "react";
import { cn } from "@repo/lib";

export interface SwitchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {}

export const Switch = React.forwardRef<
  HTMLInputElement,
  SwitchProps
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
          "h-6 w-11 rounded-full bg-gray-300 transition-colors",
          "peer-checked:bg-primary"
        )}
      />

      <div
        className={cn(
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          "peer-checked:translate-x-5"
        )}
      />
    </label>
  );
});

Switch.displayName = "Switch";