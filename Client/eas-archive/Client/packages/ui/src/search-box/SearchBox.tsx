"use client";

import { Search } from "lucide-react";
import { cn } from "@repo/lib";

import { searchBoxVariants } from "./SearchBox.styles";
import type { SearchBoxProps } from "./SearchBox.types";

export function SearchBox({
  value,
  placeholder = "Search...",
  onChange,
  className,
  ...props
}: SearchBoxProps) {
  return (
    <div className="relative w-full">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(searchBoxVariants(), className)}
        {...props}
      />
    </div>
  );
}