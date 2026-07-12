"use client";

import * as React from "react";
import { Database } from "lucide-react";
import { cn } from "@repo/lib";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title = "No records found",
  description = "There are currently no available records.",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-10 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        {icon ?? (
          <Database
            size={40}
            className="text-gray-400"
          />
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-500 max-w-md">
        {description}
      </p>

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}