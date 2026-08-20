"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Badge,
  UserCell,
} from "@repo/ui/index";

import type { ReportRecord } from "./type";

export const columns: ColumnDef<ReportRecord>[] = [
  {
    accessorKey: "participantName",

    header: "Participant",

    cell: ({ row }) => {
      const participant = row.original;

      return (
        <UserCell
          name={participant.participantName}
          email={participant.email}
        />
      );
    },
  },

  {
    accessorKey: "training",

    header: "Training",

    cell: ({ row }) => {
      const record = row.original;

      return (
        <div className="min-w-[220px]">
          <p className="font-semibold text-gray-900">
            {record.training}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {record.batch}
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "trainer",

    header: "Trainer",

    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-700">
        {row.original.trainer}
      </span>
    ),
  },

  {
    accessorKey: "enrollmentDate",

    header: "Enrollment Date",

    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-gray-600">
        {row.original.enrollmentDate}
      </span>
    ),
  },

  {
    accessorKey: "attendance",

    header: "Attendance",

    cell: ({ row }) => {
      const record = row.original;

      const percentage =
        record.sessions > 0
          ? Math.round(
              (record.attendance /
                record.sessions) *
                100,
            )
          : 0;

      return (
        <div className="w-[130px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">
              {record.attendance}/
              {record.sessions}
            </span>

            <span className="text-[10px] text-gray-400">
              {percentage}%
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#191c1e]"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "score",

    header: "Assessment",

    cell: ({ row }) => {
      const score = row.original.score;

      if (score === null) {
        return (
          <span className="text-xs text-gray-400">
            Not taken
          </span>
        );
      }

      return (
        <span
          className={`font-semibold ${
            score >= 75
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {score}%
        </span>
      );
    },
  },

  {
    accessorKey: "status",

    header: "Status",

    cell: ({ row }) => {
      const status = row.original.status;

      let variant:
        | "active"
        | "inactive"
        | "warning"
        | "success"
        | "error"
        | "neutral"
        | "pending" =
        "neutral";

      if (
        status === "Active" ||
        status === "Approved"
      ) {
        variant = "active";
      }

      if (
        status === "Completed" ||
        status === "Passed"
      ) {
        variant = "success";
      }

      if (
        status === "Pending"
      ) {
        variant = "pending";
      }

      if (
        status === "Failed" ||
        status === "Absent"
      ) {
        variant = "error";
      }

      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      );
    },
  },

  {
    id: "actions",

    header: "Actions",

    cell: ({ row, table }) => {
      const record = row.original;

      const meta = table.options.meta as
        | {
            onView?: (
              record: ReportRecord,
            ) => void;
          }
        | undefined;

      return (
        <button
          type="button"
          onClick={() =>
            meta?.onView?.(record)
          }
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          View
        </button>
      );
    },
  },
];