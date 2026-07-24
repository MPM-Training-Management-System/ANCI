import type { HTMLAttributes } from "react";

export interface ProgressProps
  extends HTMLAttributes<HTMLDivElement> {
  value: number;
  showValue?: boolean;
  color?: "primary" | "success" | "warning" | "danger";
}