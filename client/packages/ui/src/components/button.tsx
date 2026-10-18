
"use client";

import * as React from "react";
import { buttonStyles } from "@repo/token";

type Variant = keyof typeof buttonStyles.variants;

type Size = keyof typeof buttonStyles.sizes;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        buttonStyles.base,
        buttonStyles.variants[variant],
        buttonStyles.sizes[size],

        // Default ACE NextGen primary button color
        variant === "primary"
          ? "!bg-[#002b5c] !text-white hover:!bg-[#0d2142]"
          : "",

        // Smooth transition and disabled state
        "transition-colors duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",

        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
