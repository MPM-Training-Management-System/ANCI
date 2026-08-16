"use client";

import * as React from "react";
import { cn } from "@repo/lib";

export interface SectionCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  count?: number | string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  maxHeight?: string;
}

const SectionCard = React.forwardRef<
  HTMLDivElement,
  SectionCardProps
>(
  (
    {
      title,
      description,
      count,
      headerAction,
      children,
      maxHeight = "520px",
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-gray-200 bg-white shadow-sm",
          className
        )}
        {...props}
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900">
              {title}
            </h2>

            {description && (
              <p className="mt-0.5 text-xs text-gray-500">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {headerAction}

            {count !== undefined && (
              <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-amber-50 px-2 text-xs font-bold text-amber-700">
                {count}
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}

        <div
          className="overflow-y-auto p-3"
          style={{ maxHeight }}
        >
          {children}
        </div>
      </div>
    );
  }
);

SectionCard.displayName = "SectionCard";

export { SectionCard };