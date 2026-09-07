"use client";

import * as React from "react";
import { cn } from "@repo/lib";

export interface IconWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";

  variant?:
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "gray";

  children: React.ReactNode;
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

const variantClasses = {
  primary: "bg-[#002B5C] text-white",
  success: "bg-emerald-500 text-white",
  warning: "bg-amber-500 text-white",
  danger: "bg-red-500 text-white",
  info: "bg-sky-500 text-white",
  gray: "bg-slate-200 text-slate-700",
};

export function IconWrapper({
  size = "md",
  variant = "primary",
  className,
  children,
  ...props
}: IconWrapperProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl shrink-0",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}