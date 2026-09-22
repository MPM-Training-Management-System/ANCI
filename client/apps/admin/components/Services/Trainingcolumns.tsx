"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  BookOpen,
  ChevronRight,
  UserRound,
} from "lucide-react";

import type {
  ServiceRequest,
  ServiceRequestStatus,
} from "@repo/types";

// ============================================================
// META
// ============================================================

export interface ServiceTrainingTableMeta {
  onView: (request: ServiceRequest) => void;
}

// ============================================================
// STATUS STYLE
// ============================================================

function getStatusStyle(
  status: ServiceRequestStatus,
) {
  switch (status) {
    case "Pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "Approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Rejected":
      return "border-red-200 bg-red-50 text-red-700";

    case "Scheduled":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "InProgress":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case "Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Cancelled":
      return "border-gray-200 bg-gray-50 text-gray-600";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

// ============================================================
// STATUS LABEL
// ============================================================

function getStatusLabel(
  status: ServiceRequestStatus,
) {
  switch (status) {
    case "Pending":
      return "Pending";

    case "Approved":
      return "Approved";

    case "Rejected":
      return "Rejected";

    case "Scheduled":
      return "Scheduled";

    case "InProgress":
      return "In Progress";

    case "Completed":
      return "Completed";

    case "Cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================================
// TABLE ROW TYPE
// ============================================================

export type ServiceTrainingTableRow =
  ServiceRequest & {
    searchValue: string;
  };

// ============================================================
// COLUMNS
// ============================================================

export const columns: ColumnDef<ServiceTrainingTableRow>[] =
  [
    // ========================================================
    // SERVICE
    // ========================================================

    {
      accessorKey: "serviceName",
      header: "Service",

      cell: ({ row }) => {
        const request = row.original;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <BookOpen className="h-4 w-4 text-gray-500" />
            </div>

            <div className="min-w-0">
              <p className="max-w-[220px] truncate text-xs font-bold text-[#17191c]">
                {request.serviceName ||
                  "Unknown Service"}
              </p>

              <p className="mt-0.5 text-[10px] text-gray-400">
                Training pathway
              </p>
            </div>
          </div>
        );
      },
    },

    // ========================================================
    // APPLICANT
    // ========================================================

    {
      accessorKey: "applicantName",
      header: "Applicant",

      cell: ({ row }) => {
        const request = row.original;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <UserRound className="h-4 w-4 text-gray-500" />
            </div>

            <div className="min-w-0">
              <p className="max-w-[180px] truncate text-xs font-semibold text-gray-700">
                {request.applicantName ||
                  "Unknown Applicant"}
              </p>

              <p className="mt-0.5 max-w-[220px] truncate text-[10px] text-gray-400">
                {request.applicantEmail ||
                  "No email"}
              </p>
            </div>
          </div>
        );
      },
    },

    // ========================================================
    // REQUESTED
    // ========================================================

    {
      accessorKey: "requestedAt",
      header: "Requested",

      cell: ({ row }) => {
        return (
          <p className="text-xs font-medium text-gray-600">
            {formatDate(
              row.original.requestedAt,
            )}
          </p>
        );
      },
    },

    // ========================================================
    // RESOLUTION
    // ========================================================

    {
      accessorKey: "resolutionType",
      header: "Resolution",

      cell: () => {
        return (
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
            Training
          </span>
        );
      },
    },

    // ========================================================
    // STATUS
    // ========================================================

    {
      accessorKey: "status",
      header: "Status",

      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <span
            className={[
              "inline-flex items-center rounded-full border",
              "px-2.5 py-1 text-[10px] font-semibold",
              getStatusStyle(status),
            ].join(" ")}
          >
            {getStatusLabel(status)}
          </span>
        );
      },
    },

    // ========================================================
    // ACTION
    // ========================================================

    {
      id: "actions",
      header: "Action",

      cell: ({ row, table }) => {
        const request = row.original;

        const meta =
          table.options.meta as
            | ServiceTrainingTableMeta
            | undefined;

        return (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                meta?.onView(request)
              }
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-[#e7e9ec]
                bg-white
                px-3
                py-2
                text-[10px]
                font-semibold
                text-gray-600
                transition
                hover:bg-gray-50
                hover:text-[#17191c]
              "
            >
              View

              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        );
      },
    },
  ];