"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Badge,
  UserCell,
} from "@repo/ui/index";

import type {
  Enrollment,
  EnrollmentStatus,
} from "./type";

export const columns: ColumnDef<Enrollment>[] = [
  {
    accessorKey: "participantName",

    header: "Participant",

    cell: ({ row }) => {
      const item = row.original;

      return (
        <UserCell
          name={item.participantName}
          email={item.participantId}
        />
      );
    },
  },

  {
    accessorKey: "training",

    header: "Training",

    cell: ({ row }) => (
      <div className="min-w-[220px]">
        <p className="font-semibold text-gray-900">
          {row.original.training}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {row.original.schedule}
        </p>
      </div>
    ),
  },

  {
    accessorKey: "batch",

    header: "Batch",

    cell: ({ row }) => (
      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-gray-600">
        {row.original.batch}
      </span>
    ),
  },

  {
    accessorKey: "appliedDate",

    header: "Applied",
  },

  {
    accessorKey: "requirements",

    header: "Requirements",

    cell: ({ row }) => {
      const item = row.original;

      const percentage =
        item.totalRequirements > 0
          ? Math.round(
              (item.requirements /
                item.totalRequirements) *
                100,
            )
          : 0;

      return (
        <div className="w-[130px]">
          <div className="flex justify-between">
            <span className="text-xs font-semibold">
              {item.requirements}/
              {item.totalRequirements}
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
            : status === "Waitlisted"
              ? "participant"
              : "pending";

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
      const item = row.original;

      const meta = table.options.meta as
        | {
            onView?: (
              enrollment: Enrollment,
            ) => void;

            onApprove?: (
              enrollment: Enrollment,
            ) => void;

            onReject?: (
              enrollment: Enrollment,
            ) => void;

            onWaitlist?: (
              enrollment: Enrollment,
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

          {item.status === "Pending" && (
            <>
              <button
                type="button"
                onClick={() =>
                  meta?.onApprove?.(item)
                }
                className="rounded-lg bg-[#191c1e] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Review
              </button>
            </>
          )}

          {item.status === "Waitlisted" && (
            <button
              type="button"
              onClick={() =>
                meta?.onApprove?.(item)
              }
              className="rounded-lg bg-[#191c1e] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Manage
            </button>
          )}
        </div>
      );
    },
  },
];