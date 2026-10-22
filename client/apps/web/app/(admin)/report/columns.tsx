
"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  TrainerReportRequest,
  TrainerReportRequestStatus,
  TrainerReportType,
} from "@repo/types";

import { Badge } from "@repo/ui/index";
import { Download, FileText } from "lucide-react";

// ============================================================
// HELPERS
// ============================================================

function formatReportType(
  reportType: TrainerReportType,
): string {
  switch (reportType) {
    case "Attendance":
      return "Attendance Report";

    case "Assessment":
      return "Assessment Results Report";

    case "TrainingSummary":
      return "Training Summary";

    case "Enrollment":
      return "Enrollment Report";

    case "Certificate":
      return "Certificate Report";

    default:
      return reportType;
  }
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(
  value?: string | null,
): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateRange(
  dateFrom?: string | null,
  dateTo?: string | null,
): string {
  if (!dateFrom && !dateTo) return "All dates";

  if (dateFrom && !dateTo) {
    return `${formatDate(dateFrom)} – Present`;
  }

  if (!dateFrom && dateTo) {
    return `Until ${formatDate(dateTo)}`;
  }

  return `${formatDate(dateFrom)} – ${formatDate(dateTo)}`;
}

// ============================================================
// STATUS BADGE
// ============================================================

function ReportStatusBadge({
  status,
}: {
  status: TrainerReportRequestStatus;
}) {
  const variantMap: Record<
    TrainerReportRequestStatus,
    "success" | "warning" | "error" | "neutral"
  > = {
    Pending: "warning",
    Approved: "neutral",
    Rejected: "error",
    Completed: "success",
  };

  return (
    <Badge variant={variantMap[status]}>
      {status}
    </Badge>
  );
}

// ============================================================
// COLUMNS
// ============================================================

export const columns: ColumnDef<TrainerReportRequest>[] = [
  // REPORT TYPE
  {
    id: "reportType",
    accessorFn: (row) => formatReportType(row.reportType),
    header: "Report Type",

    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dbe5ef] bg-[#f4f8fb] text-[#002b5c]">
          <FileText className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="max-w-[220px] truncate text-sm font-semibold text-gray-900">
            {formatReportType(row.original.reportType)}
          </p>

          <p className="mt-0.5 text-[10px] text-gray-400">
            Report request
          </p>
        </div>
      </div>
    ),
  },

  // TRAINING BATCH
  {
    id: "batchCode",
    accessorFn: (row) => row.batchCode ?? "",
    header: "Training Batch",

    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-gray-700">
        {row.original.batchCode || "—"}
      </span>
    ),
  },

  // TRAINING PROGRAM
  {
    id: "trainingProgramName",
    accessorFn: (row) => row.trainingProgramName ?? "",
    header: "Training Program",

    cell: ({ row }) => (
      <p className="max-w-[220px] truncate text-xs font-semibold text-gray-800">
        {row.original.trainingProgramName || "Unknown Training"}
      </p>
    ),
  },

  // DATE RANGE
  {
    id: "dateRange",
    accessorFn: (row) =>
      formatDateRange(row.dateFrom, row.dateTo),
    header: "Date Range",

    cell: ({ row }) => (
      <span className="whitespace-nowrap text-xs text-gray-600">
        {formatDateRange(
          row.original.dateFrom,
          row.original.dateTo,
        )}
      </span>
    ),
  },

  // REQUESTED DATE
  {
    id: "requestedAt",
    accessorFn: (row) => row.requestedAt ?? "",
    header: "Requested",

    cell: ({ row }) => (
      <span className="whitespace-nowrap text-xs text-gray-600">
        {formatDateTime(row.original.requestedAt)}
      </span>
    ),
  },

  // STATUS
  {
    id: "status",
    accessorFn: (row) => row.status,
    header: "Status",

    cell: ({ row }) => (
      <ReportStatusBadge status={row.original.status} />
    ),
  },

  // ACTION
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    enableColumnFilter: false,

    cell: ({ row }) => {
      const request = row.original;

      if (request.reportFileUrl) {
        return (
          <div
            className="flex justify-end"
            onClick={(event) => event.stopPropagation()}
          >
            <a
              href={request.reportFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#002b5c] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#0d2142]"
            >
              <Download className="h-3.5 w-3.5" />
              View Report
            </a>
          </div>
        );
      }

      return (
        <div className="flex justify-end">
          <span className="text-xs text-slate-400">
            No file yet
          </span>
        </div>
      );
    },
  },
];
