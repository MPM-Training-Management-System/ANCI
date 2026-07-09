"use client";

import { Search } from "lucide-react";
import * as React from "react";

interface DataTableToolbarProps {
  searchable?: boolean;
  searchPlaceholder?: string;

  value: string;
  onChange: (value: string) => void;

  children?: React.ReactNode;
}

export function DataTableToolbar({
  searchable = true,
  searchPlaceholder = "Search...",
  value,
  onChange,
  children,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">

      {/* Left */}

      <div className="flex flex-1 items-center gap-3">

        {searchable && (
          <div className="relative w-full max-w-sm">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="
                h-10
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                pl-10
                pr-4
                text-sm
                outline-none
                transition
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-500/20
              "
            />

          </div>
        )}

      </div>

      {/* Right */}

      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}

    </div>
  );
}