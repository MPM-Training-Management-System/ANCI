import * as React from "react";
import { badgeStyles } from "@repo/token";

type Variant = keyof typeof badgeStyles.variants;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({
  variant = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[badgeStyles.base, badgeStyles.variants[variant], className].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}