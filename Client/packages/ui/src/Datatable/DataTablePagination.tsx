"use client";

import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: Props<TData>) {
  const {
    pageIndex,
    pageSize,
  } = table.getState().pagination;

  const total = table.getFilteredRowModel().rows.length;

  const start =
    total === 0 ? 0 : pageIndex * pageSize + 1;

  const end = Math.min(
    (pageIndex + 1) * pageSize,
    total
  );

  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col gap-4 border-t bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-900">
          {start}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-gray-900">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900">
          {total}
        </span>{" "}
        records
      </p>

      <div className="flex items-center gap-1">

        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from({ length: pageCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => table.setPageIndex(index)}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition
              ${
                pageIndex === index
                  ? "bg-primary text-white"
                  : "border hover:bg-gray-100"
              }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>

      </div>
    </div>
  );
}