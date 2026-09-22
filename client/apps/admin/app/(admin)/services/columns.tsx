import type { ColumnDef } from "@tanstack/react-table";

import type { Service } from "@repo/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/index";

export interface ServiceTableMeta {
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export const columns: ColumnDef<Service>[] = [
  {
    accessorKey: "serviceCode",
    header: "Service Code",
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-mono text-[11px] font-semibold text-gray-600">
        {row.original.serviceCode}
      </span>
    ),
  },

  {
    accessorKey: "name",
    header: "Service",
    cell: ({ row }) => (
      <div className="min-w-0 max-w-[260px]">
        <p className="truncate text-xs font-semibold text-gray-800">
          {row.original.name}
        </p>

        {row.original.description && (
          <p className="mt-1 truncate text-[11px] text-gray-400">
            {row.original.description}
          </p>
        )}
      </div>
    ),
  },

  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
        {row.original.category}
      </span>
    ),
  },

  {
    accessorKey: "requiresTraining",
    header: "Training",
    cell: ({ row }) =>
      row.original.requiresTraining ? (
        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Required
        </span>
      ) : (
        <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
          Not Required
        </span>
      ),
  },

  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Active
        </span>
      ) : (
        <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
          Inactive
        </span>
      ),
  },

  {
    id: "requirements",
    header: "Requirements",
    cell: ({ row }) => {
      const count = row.original.requirements?.length ?? 0;

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
    cell: ({ row, table }) => {
      const service = row.original;
      const meta = table.options.meta as ServiceTableMeta;

      return (
        <div
          className="flex items-center justify-end"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                aria-label={`Actions for ${service.name}`}
              >
                <span className="text-base leading-none">⋯</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-36"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <DropdownMenuItem
                onSelect={() => {
                  meta.onEdit(service);
                }}
              >
                Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={() => {
                  meta.onDelete(service);
                }}
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
