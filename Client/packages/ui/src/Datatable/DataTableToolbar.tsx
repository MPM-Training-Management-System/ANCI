"use client";

import { Search } from "lucide-react";
import * as React from "react";
import { SearchInput } from '../navigation/search-input'
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

            <SearchInput
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={searchPlaceholder}
            />
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