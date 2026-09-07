"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  AssessmentType,
  ExamResult,
  ExamResultStatus,
} from "./types";

export interface ExamResultsTableMeta {
  onViewResult: (
    result: ExamResult,
  ) => void;

  onAllowRetake: (
    result: ExamResult,
  ) => void;

  onRevokeRetake: (
    result: ExamResult,
  ) => void;
}

/* =========================================================
   RESULT BADGE
========================================================= */

function ResultBadge({
  result,
}: {
  result: ExamResultStatus;
}) {
  const styles: Record<
    ExamResultStatus,
    string
  > = {
    Passed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Failed:
      "border-red-200 bg-red-50 text-red-700",

    "For Retake":
      "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${styles[result]}`}
    >
      {result}
    </span>
  );
}

/* =========================================================
   ASSESSMENT TYPE
========================================================= */

function AssessmentTypeBadge({
  type,
}: {
  type: AssessmentType;
}) {
  return (
    <span
      className={`inline-flex rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${
        type === "Written Exam"
          ? "bg-violet-50 text-violet-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {type}
    </span>
  );
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  fullName: string,
) {
  const parts = fullName
    .trim()
    .split(/\s+/);

  if (parts.length === 1) {
    return (
      parts[0]?.charAt(0) ?? "?"
    ).toUpperCase();
  }

  return `${parts[0]?.charAt(0) ?? ""}${
    parts[
      parts.length - 1
    ]?.charAt(0) ?? ""
  }`.toUpperCase();
}

/* =========================================================
   COLUMNS
========================================================= */

export const columns: ColumnDef<ExamResult>[] =
  [
    /* =====================================================
       PARTICIPANT
    ===================================================== */

    {
      accessorKey:
        "participantName",

      header: "Participant",

      cell: ({ row }) => {
        const result =
          row.original;

        return (
          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[10px] font-bold text-gray-600">
              {getInitials(
                result.participantName,
              )}
            </div>

            <div className="min-w-0">

              <p className="truncate text-xs font-semibold">
                {
                  result.participantName
                }
              </p>

              <p className="mt-1 truncate text-[9px] text-gray-400">
                {
                  result.participantId
                }
              </p>

            </div>

          </div>
        );
      },
    },

    /* =====================================================
       ASSESSMENT
    ===================================================== */

    {
      accessorKey:
        "assessmentTitle",

      header: "Assessment",

      cell: ({ row }) => {
        const result =
          row.original;

        return (
          <div className="max-w-[240px]">

            <p className="truncate text-xs font-semibold">
              {
                result.assessmentTitle
              }
            </p>

            <p className="mt-1 text-[9px] text-gray-400">
              {
                result.trainingCode
              }
            </p>

          </div>
        );
      },
    },

    /* =====================================================
       TYPE
    ===================================================== */

    {
      accessorKey:
        "assessmentType",

      header: "Type",

      cell: ({ row }) => (
        <AssessmentTypeBadge
          type={
            row.original
              .assessmentType
          }
        />
      ),
    },

    /* =====================================================
       ATTEMPT
    ===================================================== */

    {
      accessorKey:
        "attemptNumber",

      header: "Attempt",

      cell: ({ row }) => (
        <div className="text-center">

          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-gray-100 px-2 text-[10px] font-bold text-gray-600">
            {
              row.original
                .attemptNumber
            }
          </span>

        </div>
      ),
    },

    /* =====================================================
       SCORE
    ===================================================== */

    {
      id: "score",

      header: "Score",

      cell: ({ row }) => {
        const result =
          row.original;

        return (
          <div className="text-center">

            <p className="text-sm font-bold">
              {result.score}/
              {result.maxScore}
            </p>

            <p className="mt-1 text-[9px] text-gray-400">
              {result.percentage}%
            </p>

          </div>
        );
      },
    },

    /* =====================================================
       PASSING
    ===================================================== */

    {
      accessorKey:
        "passingScore",

      header: "Passing",

      cell: ({ row }) => (
        <div className="text-center">

          <span className="text-xs font-semibold text-gray-600">
            {
              row.original
                .passingScore
            }
            %
          </span>

        </div>
      ),
    },

    /* =====================================================
       RESULT
    ===================================================== */

    {
      accessorKey: "result",

      header: "Result",

      cell: ({ row }) => (
        <div className="text-center">
          <ResultBadge
            result={
              row.original.result
            }
          />
        </div>
      ),
    },

    /* =====================================================
       SUBMITTED
    ===================================================== */

    {
      accessorKey:
        "submittedAt",

      header: "Submitted",

      cell: ({ row }) => (
        <span className="whitespace-nowrap text-[10px] text-gray-500">
          {
            row.original
              .submittedAt
          }
        </span>
      ),
    },

    /* =====================================================
       ACTIONS
    ===================================================== */

    {
      id: "actions",

      header: "Actions",

      cell: ({
        row,
        table,
      }) => {
        const result =
          row.original;

        const meta =
          table.options.meta as
            | ExamResultsTableMeta
            | undefined;

        return (
          <div className="flex justify-end gap-1.5">

            <button
              type="button"
              onClick={() =>
                meta?.onViewResult(
                  result,
                )
              }
              className="rounded-lg bg-[#191c1e] px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90"
            >
              View Result
            </button>

            {result.retakeStatus ===
            "Allowed" ? (
              <button
                type="button"
                onClick={() =>
                  meta?.onRevokeRetake(
                    result,
                  )
                }
                className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                Revoke Retake
              </button>
            ) : result.result ===
                "Failed" ? (
              <button
                type="button"
                onClick={() =>
                  meta?.onAllowRetake(
                    result,
                  )
                }
                className="rounded-lg bg-blue-50 px-3 py-2 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Allow Retake
              </button>
            ) : null}

          </div>
        );
      },
    },
  ];