import * as React from "react";
import { alertStyles } from "@repo/token";

type Variant = keyof typeof alertStyles.variants;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export function Alert({
  variant = "info",
  className = "",
  children,
  ...props
}: AlertProps) {
  return (
    <div
      className={[alertStyles.base, alertStyles.variants[variant], className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}