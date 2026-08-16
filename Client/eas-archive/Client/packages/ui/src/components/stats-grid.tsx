"use client";

import * as React from "react";
import { cn } from "@repo/lib";

export interface StatsGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4 | 5 | 6;
}

const columnClasses = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

export function StatsGrid({
  columns = 4,
  className,
  children,
  ...props
}: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        columnClasses[columns],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}