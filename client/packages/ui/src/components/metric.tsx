"use client";

import * as React from "react";


export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}



import { IconType } from "./section-card";
type MetricRowProps = {
  label: string;
  value: string | number;
  icon?: IconType;
  iconClassName?: string;
};

export function MetricRow({
  label,
  value,
  icon: Icon,
  iconClassName = "bg-slate-100 text-slate-500",
}: MetricRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}

        <span className="truncate text-sm text-slate-600">
          {label}
        </span>
      </div>

      <span className="shrink-0 text-sm font-semibold text-slate-900">
        {typeof value === "number"
          ? formatNumber(value)
          : value}
      </span>
    </div>
  );
}