"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Badge,
  UserCell,
} from "@repo/ui/index";

import type {
  Enrollment,
} from "@repo/types";

export const columns: ColumnDef<Enrollment>[] = [
  {
    accessorKey: "participantName",

    header: "Participant",

    cell: ({ row }) => {
      const item = row.original;

      return (

           <UserCell
        name={item.participant.fullName}
        email={item.participant.email}
        image={item.participant.profileImageUrl ?? undefined}
      />
      );
    },
  },

  {
    accessorKey: "programName",

    header: "Training",

    cell: ({ row }) => (
      <div className="min-w-[220px]">
        <p className="font-semibold text-gray-900">
          {row.original.programName}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Batch: {row.original.batchCode}
        </p>
      </div>
    ),
  },

  {
    accessorKey: "batchCode",

    header: "Batch",

    cell: ({ row }) => (
      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-gray-600">
        {row.original.batchCode}
      </span>
    ),
  },

  {
    accessorKey: "enrolledAt",

    header: "Applied",

    cell: ({ row }) => {
      const date = new Date(
        row.original.enrolledAt
      );

      return (
        <span className="text-sm text-gray-600">
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      );
    },
  },

  {
    accessorKey: "status",

    header: "Status",

    cell: ({ row }) => {
      const status =
        row.original.status;

      const variant =
        status === "Approved"
          ? "success"
          : status === "Rejected"
            ? "error"
            : "pending";

      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      );
    },
  },

  {
    id: "requirements",

    header: "Requirements",

    cell: ({ row }) => {
      const documents =
        row.original.documents;

      const total =
        documents.length;

      const approved =
        documents.filter(
          document =>
            document.status ===
            "Approved"
        ).length;

      const percentage =
        total > 0
          ? Math.round(
              (approved / total) * 100
            )
          : 0;

      return (
        <div className="w-[130px]">
          <div className="flex justify-between">
            <span className="text-xs font-semibold">
              {approved}/{total}
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
    id: "actions",

    header: "Actions",

    cell: ({ row, table }) => {
      const item =
        row.original;

      const meta =
        table.options.meta as
          | {
              onView?: (
                enrollment: Enrollment
              ) => void;

              onApprove?: (
                enrollment: Enrollment
              ) => void;

              onReject?: (
                enrollment: Enrollment
              ) => void;
            }
          | undefined;

      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              meta?.onView?.(item)
            }
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            View
          </button>

          {item.status ===
            "Pending" && (
            <button
              type="button"
              onClick={() =>
                meta?.onApprove?.(item)
              }
              className="rounded-lg bg-[#191c1e] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Review
            </button>
          )}
        </div>
      );
    },
  },
];