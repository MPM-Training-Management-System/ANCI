"use client";

import * as React from "react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableLoading } from "./DataTableLoading";
import { DataTableEmpty } from "./DataTableEmpty";

import type { DataTableProps } from "./type";
import { Button } from "../components";

export function DataTable<TData>({
  title,
  description,

  columns,
  data,

  loading = false,

  searchable = true,
  searchPlaceholder = "Search...",

  showPagination = true,

  addButton,

  toolbar,

  emptyTitle = "No records found",
  emptyDescription = "There are no available records.",

  meta,
}: DataTableProps<TData>) {
  const [sorting, setSorting] =
    React.useState<SortingState>([]);

  const [globalFilter, setGlobalFilter] =
    React.useState("");

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      globalFilter,
    },

    meta,

    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <section className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* OPTIONAL TITLE */}
      {(title || description) && (
        <div className="border-b border-gray-200 px-6 py-5">
          {title && (
            <h2 className="text-base font-semibold text-gray-900">
              {title}
            </h2>
          )}

          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}

      {/* TOOLBAR */}
      <div className="border-b border-gray-200 bg-white px-5 py-4">
        <DataTableToolbar
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          value={globalFilter}
          onChange={setGlobalFilter}
        >
          <div className="flex flex-wrap items-center gap-2">

            {toolbar}

            {addButton && (
              <Button
                variant="primary"
                onClick={addButton.onClick}
                className="
                  h-10
                  rounded-md
                  px-4
                  text-sm
                  font-medium
                  shadow-sm
                "
              >
                {addButton.icon}
                <span>{addButton.label}</span>
              </Button>
            )}

          </div>
        </DataTableToolbar>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">

          {/* HEADER */}
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    className="
                      whitespace-nowrap
                      border-b
                      border-gray-200
                      px-5
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-gray-500
                    "
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* BODY */}
          <tbody className="bg-white">

            {loading ? (
              <DataTableLoading
                rows={8}
                columns={columns.length}
              />
            ) : table.getRowModel().rows.length === 0 ? (
              <DataTableEmpty
                columns={columns.length}
                title={emptyTitle}
                description={emptyDescription}
              />
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="
                    group
                    transition-colors
                    duration-150
                    hover:bg-gray-50/80
                  "
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="
                        whitespace-nowrap
                        border-b
                        border-gray-100
                        px-5
                        py-3.5
                        text-sm
                        text-gray-700
                      "
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {showPagination && (
        <div className="border-t border-gray-200">
          <DataTablePagination table={table} />
        </div>
      )}
    </section>
  );
}