"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Badge,
  UserCell,
} from "@repo/ui/index";

import type { TrainingGrade } from "@repo/types";

export const columns: ColumnDef<TrainingGrade>[] = [
  {
    accessorKey: "participantName",
    header: "Participant",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <UserCell
          name={item.participantName}
          email={item.batchCode}
          image={item.profileImageUrl}
        />
      );
    },
  },

  {
    accessorKey: "attendancePercentage",
    header: () => (
      <div>
        <div>Attendance</div>
        <span className="text-xs font-normal text-muted-foreground">
          20%
        </span>
      </div>
    ),
    cell: ({ row }) => (
      <GradeCell
        percentage={row.original.attendancePercentage}
        weighted={row.original.attendanceWeightedScore}
      />
    ),
  },

  {
    accessorKey: "participationPercentage",
    header: () => (
      <div>
        <div>Active Participation</div>
        <span className="text-xs font-normal text-muted-foreground">
          20%
        </span>
      </div>
    ),
    cell: ({ row }) => (
      <GradeCell
        percentage={
          row.original.participationPercentage
        }
        weighted={
          row.original.participationWeightedScore
        }
      />
    ),
  },

  {
    accessorKey: "examPercentage",
    header: () => (
      <div>
        <div>Exam</div>
        <span className="text-xs font-normal text-muted-foreground">
          30%
        </span>
      </div>
    ),
    cell: ({ row }) => (
      <GradeCell
        percentage={row.original.examPercentage}
        weighted={row.original.examWeightedScore}
      />
    ),
  },

  {
    accessorKey: "practicalPercentage",
    header: () => (
      <div>
        <div>Practical</div>
        <span className="text-xs font-normal text-muted-foreground">
          30%
        </span>
      </div>
    ),
    cell: ({ row }) => (
      <GradeCell
        percentage={
          row.original.practicalPercentage
        }
        weighted={
          row.original.practicalWeightedScore
        }
      />
    ),
  },

  {
    accessorKey: "overallGrade",
    header: "Overall",
    cell: ({ row }) => (
      <span className="font-semibold">
        {row.original.overallGrade.toFixed(2)}%
      </span>
    ),
  },

  {
    id: "status",
    accessorFn: (row) =>
      row.isPassed ? "Passed" : "Failed",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.isPassed
            ? "success"
            : "error"
        }
      >
        {row.original.isPassed
          ? "Passed"
          : "Failed"}
      </Badge>
    ),
  },
];

function GradeCell({
  percentage,
  weighted,
}: {
  percentage: number;
  weighted: number;
}) {
  const progress = Math.min(
    Math.max(percentage, 0),
    100
  );

  return (
    <div className="min-w-[150px] space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">
          {percentage.toFixed(2)}%
        </span>

        <span className="text-xs text-muted-foreground">
          +{weighted.toFixed(2)}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}