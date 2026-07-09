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

import { DataTableHeader } from "./DataTableHeader";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableLoading } from "./DataTableLoading";
import { DataTableEmpty } from "./DataTableEmpty";

import type { DataTableProps } from "./type";

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
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,

    columns,

    state: {
      sorting,
      globalFilter,
    },

    onSortingChange: setSorting,

    onGlobalFilterChange: setGlobalFilter,

    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),

    getFilteredRowModel: getFilteredRowModel(),

    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      <DataTableHeader
        title={title}
        description={description}
        addButton={addButton}
      />

      <DataTableToolbar
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        value={globalFilter}
        onChange={setGlobalFilter}
      >
        {toolbar}
      </DataTableToolbar>

      <div className="overflow-x-auto">

        <table className="min-w-full border-collapse">

          <thead className="bg-gray-50">

            {table.getHeaderGroups().map((group) => (

              <tr key={group.id}>

                {group.headers.map((header) => (

                  <th
                    key={header.id}
                    className="
                    border-b
                    border-gray-200
                    px-6
                    py-3
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
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

          <tbody>

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
                  transition-colors
                  hover:bg-gray-50
                  "
                >

                  {row.getVisibleCells().map((cell) => (

                    <td
                      key={cell.id}
                      className="
                      border-b
                      border-gray-100
                      px-6
                      py-4
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

      {showPagination && (

        <DataTablePagination
          table={table}
        />

      )}

    </section>
  );
}