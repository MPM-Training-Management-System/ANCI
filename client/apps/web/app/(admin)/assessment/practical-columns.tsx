"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  User,
  XCircle,
} from "lucide-react";

type PracticalTableRow = {
  id: string;
  participantName: string;
  participantCode?: string | null;
  participantEmail?: string | null;
  batchCode?: string | null;
  isEvaluated?: boolean;
  score?: number | null;
  percentage?: number | null;
  result?: string | null;
  onEvaluate?: () => void;
  onViewResult?: () => void;
};

function ResultBadge({
  result,
}: {
  result?: string | null;
}) {
  const normalized = result?.toLowerCase() ?? "";

  if (
    normalized === "passed" ||
    normalized === "pass"
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

export const practicalColumns: ColumnDef<PracticalTableRow>[] = [
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
    accessorKey: "batchCode",
    header: "Batch",

    cell: ({ row }) => {
      const participant = row.original;

      return (
        <span className="text-sm font-medium text-gray-700">
          {participant.batchCode || "—"}
        </span>
      );
    },
  },

  {
    id: "evaluation",
    header: "Evaluation",

    accessorFn: (row) =>
      row.isEvaluated ? "Evaluated" : "Pending",

    cell: ({ row }) => {
      const participant = row.original;

      if (participant.isEvaluated) {
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Evaluated
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
          <Clock3 className="h-3.5 w-3.5" />
          Pending
        </span>
      );
    },
  },

  {
    accessorKey: "score",
    header: "Score",

    cell: ({ row }) => {
      const participant = row.original;

      if (!participant.isEvaluated) {
        return (
          <span className="text-sm text-gray-400">
            —
          </span>
        );
      }

      return (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {participant.score != null
              ? participant.score.toFixed(2)
              : "—"}
          </p>

          {participant.percentage != null && (
            <p className="mt-0.5 text-xs text-gray-400">
              {participant.percentage.toFixed(2)}%
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

      if (participant.isEvaluated) {
        return (
          <button
            type="button"
            onClick={participant.onViewResult}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            View
          </button>
        );
      }

      return (
        <button
          type="button"
          onClick={participant.onEvaluate}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          Evaluate
        </button>
      );
    },
  },
];