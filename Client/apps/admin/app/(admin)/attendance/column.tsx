"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@repo/ui/index";

export type SubmissionStatus =
  | "Draft"
  | "Submitted"
  | "Verified"
  | "Returned";

export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Excused";

export type AttendanceMethod =
  | "QR"
  | "Manual";

export type AttendanceRecord = {
  id: string;
  participantId: string;
  participantName: string;
  timeIn: string;
  timeOut: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
  remarks: string;
};

export type AttendanceSubmission = {
  id: string;

  trainingId: string;
  trainingName: string;

  sessionId: string;
  sessionName: string;

  date: string;

  trainerId: string;
  trainerName: string;

  submittedAt: string | null;
  submittedBy: string | null;

  status: SubmissionStatus;

  remarks: string;

  records: AttendanceRecord[];
};

export type AttendanceTableMeta = {
  onView?: (
    submission: AttendanceSubmission,
  ) => void;

  onVerify?: (
    submission: AttendanceSubmission,
  ) => void;

  onReturn?: (
    submission: AttendanceSubmission,
  ) => void;
};

const submissionStatusStyles: Record<
  SubmissionStatus,
  string
> = {
  Draft:
    "border-gray-200 bg-gray-50 text-gray-600",

  Submitted:
    "border-blue-200 bg-blue-50 text-blue-700",

  Verified:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  Returned:
    "border-red-200 bg-red-50 text-red-700",
};

export const columns: ColumnDef<AttendanceSubmission>[] =
  [
    // =====================================================
    // DATE
    // =====================================================

    {
      accessorKey: "date",

      header: "Date",

      cell: ({ row }) => {
        const submission =
          row.original;

        return (
          <div>
            <p className="text-xs font-semibold text-gray-800">
              {formatDate(
                submission.date,
              )}
            </p>

            <p className="mt-1 font-mono text-[10px] text-gray-400">
              {submission.id}
            </p>
          </div>
        );
      },
    },

    // =====================================================
    // TRAINING
    // =====================================================

    {
      accessorKey: "trainingName",

      header: "Training",

      cell: ({ row }) => {
        const submission =
          row.original;

        return (
          <div className="min-w-[220px]">
            <p className="max-w-[260px] truncate text-xs font-semibold text-gray-800">
              {submission.trainingName}
            </p>

            <p className="mt-1 max-w-[260px] truncate text-[10px] text-gray-400">
              {submission.sessionName}
            </p>
          </div>
        );
      },
    },

    // =====================================================
    // TRAINER
    // =====================================================

    {
      accessorKey: "trainerName",

      header: "Trainer",

      cell: ({ row }) => {
        const submission =
          row.original;

        return (
          <div className="flex items-center gap-2.5">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-[10px] font-bold text-purple-700">
              {getInitials(
                submission.trainerName,
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-800">
                {submission.trainerName}
              </p>

              <p className="mt-0.5 text-[10px] text-gray-400">
                {submission.trainerId}
              </p>
            </div>

          </div>
        );
      },
    },

    // =====================================================
    // PARTICIPANTS
    // =====================================================

    {
      id: "participants",

      header: "Participants",

      enableSorting: false,

      cell: ({ row }) => {
        const submission =
          row.original;

        return (
          <div>
            <p className="text-xs font-semibold">
              {submission.records.length}
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              enrolled participants
            </p>
          </div>
        );
      },
    },

    // =====================================================
    // ATTENDANCE
    // =====================================================

    {
      id: "attendance",

      header: "Attendance",

      enableSorting: false,

      cell: ({ row }) => {
        const records =
          row.original.records;

        const present =
          records.filter(
            (record) =>
              record.status ===
              "Present",
          ).length;

        const late =
          records.filter(
            (record) =>
              record.status ===
              "Late",
          ).length;

        const absent =
          records.filter(
            (record) =>
              record.status ===
              "Absent",
          ).length;

        const excused =
          records.filter(
            (record) =>
              record.status ===
              "Excused",
          ).length;

        return (
          <div className="flex flex-wrap gap-1">

            <MiniStatus
              label="P"
              value={present}
              className="border-emerald-200 bg-emerald-50 text-emerald-700"
            />

            <MiniStatus
              label="L"
              value={late}
              className="border-amber-200 bg-amber-50 text-amber-700"
            />

            <MiniStatus
              label="A"
              value={absent}
              className="border-red-200 bg-red-50 text-red-700"
            />

            {excused > 0 && (
              <MiniStatus
                label="E"
                value={excused}
                className="border-blue-200 bg-blue-50 text-blue-700"
              />
            )}

          </div>
        );
      },
    },

    // =====================================================
    // SUBMITTED
    // =====================================================

    {
      accessorKey: "submittedAt",

      header: "Submitted",

      cell: ({ row }) => {
        const submission =
          row.original;

        if (
          !submission.submittedAt
        ) {
          return (
            <span className="text-xs text-gray-400">
              Not submitted
            </span>
          );
        }

        return (
          <div>
            <p className="text-xs font-medium">
              {formatDateTime(
                submission.submittedAt,
              )}
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              by{" "}
              {
                submission.submittedBy
              }
            </p>
          </div>
        );
      },
    },

    // =====================================================
    // STATUS
    // =====================================================

    {
      accessorKey: "status",

      header: "Status",

      cell: ({ row }) => {
        const status =
          row.original.status;

        return (
         <Badge
  variant={
    status === "Verified"
      ? "success"
      : status === "Returned"
        ? "error"
        : status === "Submitted"
          ? "warning"
          : "neutral"
  }
>
  {status}
</Badge>
        );
      },
    },

    // =====================================================
    // ACTIONS
    // =====================================================

    {
      id: "actions",

      header: "Actions",

      enableSorting: false,

      enableGlobalFilter: false,

      cell: ({ row, table }) => {
        const submission =
          row.original;

        const meta =
          table.options.meta as
            | AttendanceTableMeta
            | undefined;

        return (
          <div className="flex items-center justify-end gap-1.5">

            <button
              type="button"
              onClick={() =>
                meta?.onView?.(
                  submission,
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              View
            </button>

            {submission.status ===
              "Submitted" && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    meta?.onReturn?.(
                      submission,
                    )
                  }
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Return
                </button>

                <button
                  type="button"
                  onClick={() =>
                    meta?.onVerify?.(
                      submission,
                    )
                  }
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-emerald-700"
                >
                  Verify
                </button>
              </>
            )}

          </div>
        );
      },
    },
  ];


// ============================================================
// MINI STATUS
// ============================================================

function MiniStatus({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <span
      className={`rounded-md border px-1.5 py-1 text-[9px] font-bold ${className}`}
      title={label}
    >
      {label}: {value}
    </span>
  );
}


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

function formatDate(
  date: string,
) {
  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatDateTime(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}