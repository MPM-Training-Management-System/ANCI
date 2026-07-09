"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { Input } from "./input";
import { cn } from "@repo/lib";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<
  HTMLInputElement,
  SearchInputProps
>(({ className, value, onClear, ...props }, ref) => {
  const hasValue = value !== undefined && value !== "";

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        ref={ref}
        value={value}
        className={cn("pl-10 pr-10", className)}
        {...props}
      />

      {hasValue && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = "SearchInput";