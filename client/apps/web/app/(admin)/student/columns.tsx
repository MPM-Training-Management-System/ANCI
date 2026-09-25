"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Award,
  CheckCircle2,
  Users,
} from "lucide-react";

import type { TrainingGrade } from "@repo/types";


function formatPercentage(value: number) {
  return `${value.toFixed(2)}%`;
}



function ProgressCell({
  percentage,
  weight,
  weightedScore,
}: {
  percentage: number;
  weight: number;
  weightedScore: number;
}) {
  const progress = Math.min(
    Math.max(percentage, 0),
    100,
  );

  return (
    <div className="min-w-37">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-900">
          {formatPercentage(percentage)}
        </span>

        <span className="text-[11px] text-gray-400">
          {weight}%
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

      <p className="mt-1 text-[11px] text-gray-400">
        Contribution: {weightedScore.toFixed(2)}
      </p>
    </div>
  );
}



function GradeStatus({
  grade,
}: {
  grade: TrainingGrade;
}) {
  if (grade.isPassed) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Passed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Failed
    </span>
  );
}


export const columns: ColumnDef<TrainingGrade>[] = [


  {
    accessorKey: "participantName",
    header: "Participant",

    cell: ({ row }) => {
      const grade = row.original;

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <Users className="h-4 w-4 text-gray-500" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {grade.participantName}
            </p>

            <p className="mt-0.5 text-xs text-gray-400">
              {grade.batchCode}
            </p>
          </div>
        </div>
      );
    },
  },


  {
    accessorKey: "attendancePercentage",

    header: () => (
      <span>
        Attendance
        <span className="ml-1 font-normal">
          20%
        </span>
      </span>
    ),

    cell: ({ row }) => {
      const grade = row.original;

      return (
        <ProgressCell
          percentage={grade.attendancePercentage}
          weight={grade.attendanceWeight}
          weightedScore={grade.attendanceWeightedScore}
        />
      );
    },
  },



  {
    accessorKey: "participationPercentage",

    header: () => (
      <span>
        Participation
        <span className="ml-1 font-normal">
          20%
        </span>
      </span>
    ),

    cell: ({ row }) => {
      const grade = row.original;

      return (
        <ProgressCell
          percentage={grade.participationPercentage}
          weight={grade.participationWeight}
          weightedScore={grade.participationWeightedScore}
        />
      );
    },
  },

  {
    accessorKey: "examPercentage",

    header: () => (
      <span>
        Exam
        <span className="ml-1 font-normal">
          30%
        </span>
      </span>
    ),

    cell: ({ row }) => {
      const grade = row.original;

      return (
        <ProgressCell
          percentage={grade.examPercentage}
          weight={grade.examWeight}
          weightedScore={grade.examWeightedScore}
        />
      );
    },
  },


  {
    accessorKey: "practicalPercentage",

    header: () => (
      <span>
        Practical
        <span className="ml-1 font-normal">
          30%
        </span>
      </span>
    ),

    cell: ({ row }) => {
      const grade = row.original;

      return (
        <ProgressCell
          percentage={grade.practicalPercentage}
          weight={grade.practicalWeight}
          weightedScore={grade.practicalWeightedScore}
        />
      );
    },
  },


  {
    accessorKey: "overallGrade",

    header: () => (
      <div className="text-right">
        Overall
      </div>
    ),

    cell: ({ row }) => {
      const grade = row.original;

      return (
        <div className="text-right">
          <span className="text-lg font-bold text-gray-900">
            {grade.overallGrade.toFixed(2)}
          </span>

          <span className="text-sm text-gray-400">
            %
          </span>
        </div>
      );
    },
  },



  {
    id: "status",

    header: "Status",

    accessorFn: (row) => row.isPassed,

    cell: ({ row }) => (
      <GradeStatus grade={row.original} />
    ),
  },
];