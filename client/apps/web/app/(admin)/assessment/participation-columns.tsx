"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  CheckCircle2,
  ClipboardCheck,
  User,
  XCircle,
} from "lucide-react";

type ParticipationTableRow = {
  id: string;
  participantName: string;
  participantCode?: string | null;
  participantEmail?: string | null;
  recitationCount?: number;
  requiredRecitations?: number;
  participationCount?: number;
  participationPercentage?: number;
  isRecorded?: boolean;
  onRecord?: () => void;
  onRemove?: () => void;
};

function ProgressCell({
  current,
  required,
}: {
  current: number;
  required: number;
}) {
  const progress =
    required > 0
      ? Math.min(
          Math.max((current / required) * 100, 0),
          100,
        )
      : 0;

  return (
    <div className="min-w-32">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-900">
          {current} / {required}
        </span>

        <span className="text-[11px] text-gray-400">
          {progress.toFixed(0)}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-800 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}

export const participationColumns: ColumnDef<ParticipationTableRow>[] = [
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
    id: "recitationProgress",
    header: "Recitation Progress",

    accessorFn: (row) =>
      `${row.recitationCount ?? 0}/${row.requiredRecitations ?? 0}`,

    cell: ({ row }) => {
      const participant = row.original;

      return (
        <ProgressCell
          current={participant.recitationCount ?? 0}
          required={participant.requiredRecitations ?? 0}
        />
      );
    },
  },

  {
    accessorKey: "participationCount",
    header: "Participation",

    cell: ({ row }) => {
      const participant = row.original;

      return (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {participant.participationCount ?? 0}
          </p>

          {participant.participationPercentage != null && (
            <p className="mt-0.5 text-xs text-gray-400">
              {participant.participationPercentage.toFixed(2)}%
            </p>
          )}
        </div>
      );
    },
  },

  {
    id: "sessionRecord",
    header: "Session Record",

    accessorFn: (row) =>
      row.isRecorded ? "Recorded" : "Not Recorded",

    cell: ({ row }) => {
      const participant = row.original;

      if (participant.isRecorded) {
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Recorded
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
          <XCircle className="h-3.5 w-3.5" />
          Not Recorded
        </span>
      );
    },
  },

  {
    id: "actions",
    header: "Action",

    cell: ({ row }) => {
      const participant = row.original;

      if (participant.isRecorded) {
        return (
          <button
            type="button"
            onClick={participant.onRemove}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Remove
          </button>
        );
      }

      return (
        <button
          type="button"
          onClick={participant.onRecord}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          Record
        </button>
      );
    },
  },
];