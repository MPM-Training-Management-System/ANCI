"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  CheckCircle2,
  Clock3,
  FileText,
  User,
  XCircle,
} from "lucide-react";

type WrittenTableRow = {
  id: string;
  participantName: string;
  participantCode?: string | null;
  participantEmail?: string | null;
  submittedAt?: string | Date | null;
  attemptNumber?: number | null;
  score?: number | null;
  totalItems?: number | null;
  percentage?: number | null;
  result?: string | null;
};

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name?: string | null) {
  if (!name) return "P";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function ResultBadge({
  result,
}: {
  result?: string | null;
}) {
  const normalized = result?.toLowerCase() ?? "";

  if (
    normalized === "passed" ||
    normalized === "pass" ||
    normalized === "complete" ||
    normalized === "completed"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Passed
      </span>
    );
  }

  if (
    normalized === "failed" ||
    normalized === "fail"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
        <XCircle className="h-3.5 w-3.5" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

export const writtenColumns: ColumnDef<WrittenTableRow>[] = [
  {
    accessorKey: "participantName",
    header: "Participant",

    cell: ({ row }) => {
      const participant = row.original;

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <User className="h-4 w-4 text-gray-500" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {participant.participantName}
            </p>

            <p className="mt-0.5 text-xs text-gray-400">
              {participant.participantCode ||
                participant.participantEmail ||
                "Participant"}
            </p>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "submittedAt",
    header: "Submitted",

    cell: ({ row }) => {
      const participant = row.original;

      return (
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-gray-400" />

          <div>
            <p className="text-sm font-medium text-gray-700">
              {formatDateTime(participant.submittedAt)}
            </p>

            {participant.attemptNumber != null && (
              <p className="mt-0.5 text-xs text-gray-400">
                Attempt {participant.attemptNumber}
              </p>
            )}
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "score",
    header: "Score",

    cell: ({ row }) => {
      const participant = row.original;

      const score =
        participant.score != null
          ? participant.score
          : null;

      const totalItems =
        participant.totalItems != null
          ? participant.totalItems
          : null;

      const percentage =
        participant.percentage != null
          ? participant.percentage
          : null;

      return (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {score != null
              ? `${score}${totalItems != null ? ` / ${totalItems}` : ""}`
              : "—"}
          </p>

          {percentage != null && (
            <p className="mt-0.5 text-xs text-gray-400">
              {percentage.toFixed(2)}%
            </p>
          )}
        </div>
      );
    },
  },

  {
    id: "result",
    header: "Result",

    accessorFn: (row) => row.result ?? "",

    cell: ({ row }) => (
      <ResultBadge result={row.original.result} />
    ),
  },

  {
    id: "actions",
    header: "Action",

    cell: ({ row }) => {
      const participant = row.original;

      const handleView = (
        participant as WrittenTableRow & {
          onView?: () => void;
        }
      ).onView;

      return (
        <button
          type="button"
          onClick={handleView}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <FileText className="h-3.5 w-3.5" />
          View
        </button>
      );
    },
  },
];