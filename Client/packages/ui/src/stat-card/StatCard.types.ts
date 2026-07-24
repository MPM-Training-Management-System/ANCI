import { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

export interface StatCardProps
  extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  footer?: ReactNode;
  variant?: "default" | "primary" | "success" | "warning";
}