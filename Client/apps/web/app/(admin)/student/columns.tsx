"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  Participant,
  ParticipantStatus,
  AssessmentStatus,
  CompletionStatus,
} from "./types";

/* =========================================================
   COLUMN DEFINITIONS
========================================================= */

export const columns: ColumnDef<Participant>[] = [
  /* =======================================================
     PARTICIPANT
  ======================================================= */

  {
    accessorKey: "name",
    header: "Participant",

    cell: ({ row }) => {
      const participant = row.original;

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#191c1e] text-[10px] font-bold text-white">
            {getInitials(participant.name)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              {participant.name}
            </p>

            <p className="mt-0.5 font-mono text-[10px] text-gray-400">
              {participant.participantId}
            </p>
          </div>
        </div>
      );
    },
  },

  /* =======================================================
     TRAINING
  ======================================================= */

  {
    accessorKey: "training",
    header: "Training",

    cell: ({ row }) => {
      const participant = row.original;

      return (
        <div className="max-w-[220px]">
          <p className="text-xs font-semibold leading-5">
            {participant.training}
          </p>

          <p className="mt-0.5 font-mono text-[10px] text-gray-400">
            {participant.trainingCode}
          </p>
        </div>
      );
    },
  },

  /* =======================================================
     STATUS
  ======================================================= */

  {
    accessorKey: "status",
    header: "Status",

    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <StatusBadge status={status} />
      );
    },
  },

  /* =======================================================
     ATTENDANCE
  ======================================================= */

  {
    accessorKey: "attendance",
    header: "Attendance",

    cell: ({ row }) => {
      const attendance =
        row.original.attendance;

      const progressColor =
        attendance >= 90
          ? "bg-emerald-500"
          : attendance >= 80
            ? "bg-amber-500"
            : "bg-red-500";

      const textColor =
        attendance >= 90
          ? "text-emerald-600"
          : attendance >= 80
            ? "text-amber-600"
            : "text-red-600";

      return (
        <div className="w-24">
          <span
            className={`text-xs font-bold ${textColor}`}
          >
            {attendance}%
          </span>

          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${progressColor}`}
              style={{
                width: `${attendance}%`,
              }}
            />
          </div>
        </div>
      );
    },
  },

  /* =======================================================
     ASSESSMENT
  ======================================================= */

  {
    accessorKey: "assessment",
    header: "Assessment",

    cell: ({ row }) => {
      const assessment =
        row.original.assessment;

      return (
        <AssessmentBadge
          status={assessment}
        />
      );
    },
  },

  /* =======================================================
     COMPLETION
  ======================================================= */

  {
    accessorKey: "completion",
    header: "Completion",

    cell: ({ row }) => {
      const completion =
        row.original.completion;

      return (
        <CompletionBadge
          status={completion}
        />
      );
    },
  },

  /* =======================================================
     ACTION
  ======================================================= */

  {
    id: "actions",
    header: "Action",

    cell: ({ row, table }) => {
      const participant = row.original;

      const meta = table.options.meta as
        | ParticipantTableMeta
        | undefined;

      return (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              meta?.onView(participant)
            }
            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            View
          </button>
        </div>
      );
    },
  },
];

/* =========================================================
   TABLE META
========================================================= */

export interface ParticipantTableMeta {
  onView: (participant: Participant) => void;
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: ParticipantStatus;
}) {
  const styles: Record<
    ParticipantStatus,
    string
  > = {
    Active:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Completed:
      "border-blue-200 bg-blue-50 text-blue-700",

    Dropped:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   ASSESSMENT BADGE
========================================================= */

function AssessmentBadge({
  status,
}: {
  status: AssessmentStatus;
}) {
  const styles: Record<
    AssessmentStatus,
    string
  > = {
    Passed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Pending:
      "border-amber-200 bg-amber-50 text-amber-700",

    Failed:
      "border-red-200 bg-red-50 text-red-700",

    "Not Started":
      "border-gray-200 bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   COMPLETION BADGE
========================================================= */

function CompletionBadge({
  status,
}: {
  status: CompletionStatus;
}) {
  const styles: Record<
    CompletionStatus,
    string
  > = {
    "In Progress":
      "border-amber-200 bg-amber-50 text-amber-700",

    Completed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Eligible:
      "border-blue-200 bg-blue-50 text-blue-700",

    Dropped:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}