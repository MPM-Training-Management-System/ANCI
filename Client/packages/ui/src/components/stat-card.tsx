"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

import { cn } from "@repo/lib";
import {
  Card,
  CardContent,
} from "./card";

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;

  value: string | number;

  description?: string;

  icon: LucideIcon;

  iconColor?: string;

  trend?: number;

  trendLabel?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "bg-[#002B5C]",
  trend,
  trendLabel,
  className,
  ...props
}: StatCardProps) {
  const positive = trend !== undefined && trend >= 0;

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
      {...props}
    >
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>

          {description && (
            <p className="text-sm text-slate-500">
              {description}
            </p>
          )}

          {trend !== undefined && (
            <div
              className={cn(
                "mt-1 flex items-center gap-1 text-sm font-semibold",
                positive
                  ? "text-emerald-600"
                  : "text-red-600"
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}

              <span>
                {Math.abs(trend)}%
              </span>

              {trendLabel && (
                <span className="font-normal text-slate-500">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl text-white",
            iconColor
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
      </CardContent>
    </Card>
  );
}