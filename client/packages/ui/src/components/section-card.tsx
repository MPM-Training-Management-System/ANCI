"use client";

import * as React from "react";
import { cn } from "@repo/lib";

export type IconType = React.ComponentType<{
  className?: string;
  size?: number;
}>;

export interface SectionCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: IconType;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className = "",
  action,
}: SectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon className="h-4 w-4" />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-900">
              {title}
            </h2>

            {description && (
              <p className="mt-0.5 text-xs text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

export { SectionCard };