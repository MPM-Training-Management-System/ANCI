"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Badge,
} from "@repo/ui/index";

import type {
  AttendanceRecordDto,
} from "@repo/types";

export type AdminAttendanceRecord =
  AttendanceRecordDto & {
    searchValue?: string;
  };

export const columns: ColumnDef<AdminAttendanceRecord>[] =
  [
    // ========================================================
    // PARTICIPANT
    // ========================================================

    {
      accessorKey:
        "participantName",

      header:
        "Participant",

      cell: ({
        row,
      }) => {
        const record =
          row.original;

        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-[10px] font-bold text-purple-700">
              {getInitials(
                record.participantName,
              )}
            </div>

            <div className="min-w-0">
              <p className="max-w-[220px] truncate text-xs font-semibold text-gray-800">
                {
                  record.participantName
                }
              </p>

              <p className="mt-0.5 max-w-[220px] truncate font-mono text-[10px] text-gray-400">
                {
                  record.id
                }
              </p>
            </div>
          </div>
        );
      },
    },

    // ========================================================
    // TIME IN
    // ========================================================

    {
      accessorKey:
        "timeIn",

      header:
        "Time In",

      cell: ({
        row,
      }) => {
        return (
          <div>
            <p className="text-xs font-semibold text-gray-800">
              {formatDateTime(
                row.original
                  .timeIn,
              )}
            </p>
          </div>
        );
      },
    },

    // ========================================================
    // TIME OUT
    // ========================================================

    {
      accessorKey:
        "timeOut",

      header:
        "Time Out",

      cell: ({
        row,
      }) => {
        return (
          <div>
            <p className="text-xs font-semibold text-gray-800">
              {formatDateTime(
                row.original
                  .timeOut,
              )}
            </p>
          </div>
        );
      },
    },

    // ========================================================
    // METHOD
    // ========================================================

    {
      accessorKey:
        "method",

      header:
        "Method",

      cell: ({
        row,
      }) => {
        const method =
          row.original
            .method;

        return (
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
            {
              method ||
              "—"
            }
          </span>
        );
      },
    },

    // ========================================================
    // STATUS
    // ========================================================

    {
      accessorKey:
        "status",

      header:
        "Status",

      cell: ({
        row,
      }) => {
        const status =
          row.original
            .status;

        return (
          <Badge
            variant={
              status ===
              "Present"
                ? "success"
                : status ===
                    "Late"
                  ? "warning"
                  : status ===
                      "Absent"
                    ? "error"
                    : "neutral"
            }
          >
            {
              status
            }
          </Badge>
        );
      },
    },

    // ========================================================
    // ACTIONS
    // ========================================================

    {
      id:
        "actions",

      header:
        "Actions",

      enableSorting:
        false,

      enableGlobalFilter:
        false,

      cell: ({
        row,
        table,
      }) => {
        const record =
          row.original;

        const meta =
          table.options
            .meta as
            | AdminAttendanceTableMeta
            | undefined;

        return (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() =>
                meta?.onView?.(
                  record,
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              View
            </button>
          </div>
        );
      },
    },
  ];

// ============================================================
// TABLE META
// ============================================================

export type AdminAttendanceTableMeta =
  {
    onView?: (
      record: AdminAttendanceRecord,
    ) => void;
  };

// ============================================================
// HELPERS
// ============================================================

function getInitials(
  name: string,
) {
  return name
    .trim()
    .split(/\s+/)
    .map(
      (part) =>
        part.charAt(0),
    )
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDateTime(
  value:
    | Date
    | string
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    },
  );
}