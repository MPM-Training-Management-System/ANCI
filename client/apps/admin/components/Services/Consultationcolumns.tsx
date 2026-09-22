"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  CalendarDays,
  ExternalLink,
  UserRound,
  Wrench,
} from "lucide-react";

import type {
  ServiceConsultation,
  ServiceConsultationStatus,
} from "@repo/types";

// ============================================================
// META
// ============================================================

export interface ServiceConsultationTableMeta {
  onEdit: (
    consultation: ServiceConsultation,
  ) => void;
}

// ============================================================
// TABLE ROW TYPE
// ============================================================

export type ServiceConsultationTableRow =
  ServiceConsultation & {
    searchValue: string;
  };

// ============================================================
// STATUS
// ============================================================

function getStatusStyle(
  status: ServiceConsultationStatus,
) {
  switch (status) {
    case "Scheduled":
      return {
        label: "Scheduled",
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
      };

    case "InProgress":
      return {
        label: "In Progress",
        className:
          "border-indigo-200 bg-indigo-50 text-indigo-700",
      };

    case "Completed":
      return {
        label: "Completed",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "Cancelled":
      return {
        label: "Cancelled",
        className:
          "border-gray-200 bg-gray-50 text-gray-600",
      };

    default:
      return {
        label: status,
        className:
          "border-gray-200 bg-gray-50 text-gray-600",
      };
  }
}

// ============================================================
// DATE
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
// TIME
// ============================================================

function formatTime(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ============================================================
// COLUMNS
// ============================================================

export const columns: ColumnDef<ServiceConsultationTableRow>[] =
  [
    // ========================================================
    // SERVICE
    // ========================================================

    {
      accessorKey: "serviceName",
      header: "Service",

      cell: ({ row }) => {
        const consultation = row.original;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <Wrench className="h-4 w-4 text-gray-500" />
            </div>

            <div className="min-w-0 max-w-[200px]">
              <p className="truncate text-xs font-semibold text-gray-800">
                {consultation.serviceName ||
                  "Unknown Service"}
              </p>

              {consultation.notes && (
                <p className="mt-1 truncate text-[11px] text-gray-400">
                  {consultation.notes}
                </p>
              )}
            </div>
          </div>
        );
      },
    },

    // ========================================================
    // CLIENT
    // ========================================================

    {
      accessorKey: "applicantName",
      header: "Client",

      cell: ({ row }) => {
        const consultation = row.original;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <UserRound className="h-4 w-4 text-gray-500" />
            </div>

            <div className="min-w-0 max-w-[200px]">
              <p className="truncate text-xs font-semibold text-gray-700">
                {consultation.applicantName ||
                  "Unknown Applicant"}
              </p>

              {consultation.applicantEmail && (
                <p className="mt-1 truncate text-[11px] text-gray-400">
                  {consultation.applicantEmail}
                </p>
              )}
            </div>
          </div>
        );
      },
    },

    // ========================================================
    // SCHEDULE
    // ========================================================

    {
      accessorKey: "scheduledAt",
      header: "Schedule",

      cell: ({ row }) => {
        const consultation = row.original;

        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </div>

            <div>
              <p className="whitespace-nowrap text-xs font-semibold text-gray-700">
                {formatDate(
                  consultation.scheduledAt,
                )}
              </p>

              <p className="mt-0.5 whitespace-nowrap text-[11px] text-gray-400">
                {formatTime(
                  consultation.scheduledAt,
                )}
              </p>
            </div>
          </div>
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
        const status = getStatusStyle(
          row.original.status,
        );

        return (
          <span
            className={[
              "inline-flex rounded-full border",
              "px-2.5 py-1 text-[10px] font-semibold",
              status.className,
            ].join(" ")}
          >
            {status.label}
          </span>
        );
      },
    },

    // ========================================================
    // MEETING
    // ========================================================

    {
      id: "meeting",
      header: "Meeting",

      cell: ({ row }) => {
        const meetingLink =
          row.original.meetingLink;

        if (!meetingLink) {
          return (
            <span className="text-xs text-gray-300">
              —
            </span>
          );
        }

        return (
          <a
            href={meetingLink}
            target="_blank"
            rel="noreferrer"
            onClick={(event) =>
              event.stopPropagation()
            }
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0b3768] hover:underline"
          >
            Open Meeting

            <ExternalLink className="h-3 w-3" />
          </a>
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
        const consultation = row.original;

        const meta =
          table.options.meta as
            | ServiceConsultationTableMeta
            | undefined;

        return (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                meta?.onEdit(consultation)
              }
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-[#17191c]"
            >
              View

              <span className="text-gray-400">
                →
              </span>
            </button>
          </div>
        );
      },
    },
  ];