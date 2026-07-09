"use client";

import {
  Table,
} from "@tanstack/react-table";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Props<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: Props<TData>) {
  return (
    <div className="flex flex-col gap-3 border-t bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">

      <div className="text-sm text-gray-500">

        Showing{" "}

        <span className="font-semibold">
          {table.getRowModel().rows.length}
        </span>{" "}

        of{" "}

        <span className="font-semibold">
          {table.getFilteredRowModel().rows.length}
        </span>{" "}

        records

      </div>

      <div className="flex items-center gap-2">

        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="
          flex
          h-9
          items-center
          gap-2
          rounded-lg
          border
          px-3
          text-sm
          transition
          hover:bg-gray-100
          disabled:cursor-not-allowed
          disabled:opacity-50
          "
        >
          <ChevronLeft size={16} />

          Previous
        </button>

        <div className="rounded-lg border bg-gray-50 px-4 py-2 text-sm font-medium">

          Page{" "}

          {table.getState().pagination.pageIndex + 1}

          {" / "}

          {table.getPageCount()}

        </div>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="
          flex
          h-9
          items-center
          gap-2
          rounded-lg
          border
          px-3
          text-sm
          transition
          hover:bg-gray-100
          disabled:cursor-not-allowed
          disabled:opacity-50
          "
        >
          Next

          <ChevronRight size={16} />

        </button>

      </div>

    </div>
  );
}