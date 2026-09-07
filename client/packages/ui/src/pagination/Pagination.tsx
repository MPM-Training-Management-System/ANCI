"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@repo/lib";

import { paginationButtonVariants } from "./Pagination.styles";

import type { PaginationProps } from "./Pagination.types";

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start =
    totalItems && pageSize
      ? (page - 1) * pageSize + 1
      : 0;

  const end =
    totalItems && pageSize
      ? Math.min(page * pageSize, totalItems)
      : 0;

  const pages = Array.from(
    {
      length: totalPages,
    },
    (_, i) => i + 1
  );

  return (
    <div className="flex items-center justify-between border-t px-6 py-4">

      <p className="text-sm text-muted-foreground">

        {totalItems
          ? `Showing ${start} - ${end} of ${totalItems}`
          : ""}

      </p>

      <div className="flex gap-2">

        <button
          disabled={page === 1}
          onClick={() =>
            onPageChange(page - 1)
          }
          className={cn(
            paginationButtonVariants()
          )}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((number) => (
          <button
            key={number}
            onClick={() =>
              onPageChange(number)
            }
            className={cn(
              paginationButtonVariants({
                active: number === page,
              })
            )}
          >
            {number}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() =>
            onPageChange(page + 1)
          }
          className={cn(
            paginationButtonVariants()
          )}
        >
          <ChevronRight size={16} />
        </button>

      </div>

    </div>
  );
}