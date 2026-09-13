"use client";

import { useMemo } from "react";

import {
  DataTable,
} from "@repo/ui/index";

import type { Service } from "@repo/types";

interface ServiceTableProps {
  services: Service[];
  isLoading: boolean;

  search: string;
  onSearchChange: (
    value: string,
  ) => void;

  onClearSearch: () => void;

  onEdit: (
    service: Service,
  ) => void;

  onDelete: (
    service: Service,
  ) => void;
}

export function ServiceTable({
  services,
  isLoading,
  search,
  onSearchChange,
  onClearSearch,
  onEdit,
  onDelete,
}: ServiceTableProps) {
  // ============================================================
  // COLUMNS
  // ============================================================

  const columns = useMemo(
    () => [
      {
        accessorKey: "serviceCode",
        header: "Service Code",
        cell: ({
          row,
        }: any) => (
          <span className="font-mono text-xs font-semibold text-gray-600">
            {row.original.serviceCode}
          </span>
        ),
      },

      {
        accessorKey: "name",
        header: "Service",
        cell: ({
          row,
        }: any) => {
          const service =
            row.original as Service;

          return (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {service.name}
              </p>

              {service.description && (
                <p className="mt-1 max-w-md truncate text-xs text-gray-400">
                  {service.description}
                </p>
              )}
            </div>
          );
        },
      },

      {
        accessorKey: "category",
        header: "Category",
        cell: ({
          row,
        }: any) => (
          <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
            {row.original.category}
          </span>
        ),
      },

      {
        accessorKey:
          "requiresTraining",
        header: "Training",
        cell: ({
          row,
        }: any) => {
          const service =
            row.original as Service;

          return service.requiresTraining ? (
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Required
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
              Not Required
            </span>
          );
        },
      },

      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({
          row,
        }: any) => {
          const service =
            row.original as Service;

          return service.isActive ? (
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Active
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              Inactive
            </span>
          );
        },
      },

      {
        id: "requirements",
        header: "Requirements",
        cell: ({
          row,
        }: any) => {
          const service =
            row.original as Service;

          const count =
            service.requirements?.length ??
            0;

          return (
            <span className="text-xs font-semibold text-gray-600">
              {count}
            </span>
          );
        },
      },

      {
        id: "actions",
        header: "Actions",
        cell: ({
          row,
        }: any) => {
          const service =
            row.original as Service;

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onEdit(service)
                }
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(service)
                }
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete],
  );

  // ============================================================
  // SEARCH VALUE FOR DATATABLE
  // ============================================================

  const tableData = useMemo(() => {
    return services.map(
      (service) => ({
        ...service,

        searchValue: [
          service.serviceCode,
          service.name,
          service.category,
          service.description,
          service.requiresTraining
            ? "training"
            : "no training",
          service.isActive
            ? "active"
            : "inactive",
        ]
          .filter(Boolean)
          .join(" "),
      }),
    );
  }, [services]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <DataTable
      title="Available Services"
      description="Manage and maintain the services offered by the organization."
      columns={columns}
      data={tableData}
      searchable
      searchPlaceholder="Search services..."
      showPagination
      emptyTitle={
        isLoading
          ? "Loading services..."
          : search
            ? "No services found"
            : "No services available"
      }
      emptyDescription={
        isLoading
          ? "Fetching services from the server."
          : search
            ? "Try using a different search keyword."
            : "Create your first service to get started."
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Search service..."
            className="h-10 w-full min-w-[220px] rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:bg-white"
          />

          <button
            type="button"
            onClick={onClearSearch}
            disabled={!search}
            className="h-10 rounded-xl border border-[#e7e9ec] bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      }
    />
  );
}
