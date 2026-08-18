"use client";

import type { ColumnDef } from "@tanstack/react-table";

export type GradingStatus = "Pending" | "Graded";

export type GradeResult =
  | "Pending"
  | "Passed"
  | "Failed";

export interface TrainingOption {
  name: string;
  code: string;
}

export interface Criterion {
  id: string;
  name: string;
  maxScore: number;
  score: number;
  remarks: string;
}

export interface PracticalGrade {
  id: string;

  participantId: string;
  participantName: string;
  participantEmail: string;

  assessmentId: string;
  assessmentTitle: string;

  training: string;
  trainingCode: string;

  attemptNumber: number;

  passingScore: number;

  status: GradingStatus;
  result: GradeResult;

  criteria: Criterion[];

  totalScore: number;
  totalMaxScore: number;
  percentage: number;

  trainerRemarks: string;

  gradedAt: string | null;
  submittedAt: string;
}

export const columns: ColumnDef<PracticalGrade>[] = [
  {
    accessorKey: "participantName",
    header: "Participant",

    cell: ({ row }) => {
      const grade = row.original;

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[10px] font-bold text-gray-600">
            {getInitials(grade.participantName)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              {grade.participantName}
            </p>

            <p className="mt-1 truncate text-[9px] text-gray-400">
              {grade.participantId}
            </p>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "assessmentTitle",
    header: "Assessment",

    cell: ({ row }) => {
      const grade = row.original;

      return (
        <div className="max-w-[260px]">
          <p className="truncate text-xs font-semibold">
            {grade.assessmentTitle}
          </p>

          <p className="mt-1 text-[9px] text-gray-400">
            {grade.trainingCode}
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "attemptNumber",
    header: "Attempt",

    cell: ({ row }) => (
      <div className="text-center">
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-gray-100 px-2 text-[10px] font-bold text-gray-600">
          {row.original.attemptNumber}
        </span>
      </div>
    ),
  },

  {
    id: "score",
    header: "Score",

    cell: ({ row }) => {
      const grade = row.original;

      if (grade.status === "Pending") {
        return (
          <span className="text-xs font-medium text-gray-400">
            Not graded
          </span>
        );
      }

      return (
        <div>
          <p className="text-sm font-bold">
            {grade.totalScore}/{grade.totalMaxScore}
          </p>

          <p className="mt-1 text-[9px] text-gray-400">
            {grade.percentage}%
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "passingScore",
    header: "Passing",

    cell: ({ row }) => (
      <span className="text-xs font-semibold text-gray-600">
        {row.original.passingScore}%
      </span>
    ),
  },

  {
    id: "status",
    header: "Status",

    cell: ({ row }) => (
      <GradingStatusBadge
        status={row.original.status}
        result={row.original.result}
      />
    ),
  },

  {
    accessorKey: "submittedAt",
    header: "Submitted",

    cell: ({ row }) => (
      <span className="whitespace-nowrap text-[10px] text-gray-500">
        {row.original.submittedAt}
      </span>
    ),
  },

  {
    id: "actions",
    header: "Actions",

    cell: ({ row }) => {
      const grade = row.original;

      return (
        <div className="flex justify-end gap-1.5">
          {grade.status === "Pending" ? (
            <button
              type="button"
              data-action="grade"
              data-id={grade.id}
              className="rounded-lg bg-[#191c1e] px-3 py-2 text-[10px] font-semibold text-white"
            >
              Grade Now
            </button>
          ) : (
            <>
              <button
                type="button"
                data-action="view"
                data-id={grade.id}
                className="rounded-lg bg-[#191c1e] px-3 py-2 text-[10px] font-semibold text-white"
              >
                View Grade
              </button>

              <button
                type="button"
                data-action="edit"
                data-id={grade.id}
                className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600"
              >
                Edit Grade
              </button>
            </>
          )}
        </div>
      );
    },
  },
];

function GradingStatusBadge({
  status,
  result,
}: {
  status: GradingStatus;
  result: GradeResult;
}) {
  if (status === "Pending") {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
        Pending Grade
      </span>
    );
  }

  if (result === "Passed") {
    return (
      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
        Passed
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-bold text-red-700">
      Failed
    </span>
  );
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return (
      parts[0]?.charAt(0) ?? "?"
    ).toUpperCase();
  }

  return `${parts[0]?.charAt(0) ?? ""}${
    parts[parts.length - 1]?.charAt(0) ?? ""
  }`.toUpperCase();
}