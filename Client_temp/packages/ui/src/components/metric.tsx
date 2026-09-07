"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@repo/lib";

export interface MetricProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;

  label?: string;

  showIcon?: boolean;

  positiveColor?: string;

  negativeColor?: string;

  neutralColor?: string;
}

export function Metric({
  value,
  label,
  showIcon = true,
  positiveColor = "text-emerald-600",
  negativeColor = "text-red-600",
  neutralColor = "text-slate-500",
  className,
  ...props
}: MetricProps) {
  const positive = value > 0;
  const negative = value < 0;
  const neutral = value === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm font-semibold",
        positive && positiveColor,
        negative && negativeColor,
        neutral && neutralColor,
        className
      )}
      {...props}
    >
      {showIcon && (
        <>
          {positive && <ArrowUpRight className="h-4 w-4" />}

          {negative && <ArrowDownRight className="h-4 w-4" />}

          {neutral && <Minus className="h-4 w-4" />}
        </>
      )}

      <span>
        {positive && "+"}

        {value}%
      </span>

      {label && (
        <span className="font-normal text-slate-500">
          {label}
        </span>
      )}
    </div>
  );
}