"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  UserCell,
} from "@repo/ui/index";

import type { Enrollment } from "@repo/types";

export interface EnrollmentTableMeta {
  onView: (enrollment: Enrollment) => void;
  onApprove: (enrollment: Enrollment) => void;
  onReject: (enrollment: Enrollment) => void;
}

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
          image={
            item.participant.profileImageUrl ??
            undefined
          }
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
      const status = row.original.status;

      const variant =
        status === "Approved"
          ? "success"
          : status === "Rejected"
            ? "error"
            : status === "Cancelled"
              ? "error"
              : status === "NeedsCorrection"
                ? "warning"
                : status === "UnderReview"
                  ? "pending"
                  : "pending";

      return (
        <Badge variant={variant}>
          {status === "UnderReview"
            ? "Under Review"
            : status === "NeedsCorrection"
              ? "Needs Correction"
              : status}
        </Badge>
      );
    },
  },

  {
    id: "requirements",
    header: "Requirements",
    cell: ({ row }) => {
      const documents = row.original.documents;

      const total = documents.length;

      const approved = documents.filter(
        (document) =>
          document.status === "Approved"
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
    enableSorting: false,
    enableColumnFilter: false,

    cell: ({ row, table }) => {
      const item = row.original;

      const meta =
        table.options.meta as
          | EnrollmentTableMeta
          | undefined;

      if (!meta) {
        return null;
      }

      return (
        <div
          className="flex items-center justify-end"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                aria-label={`Actions for ${item.participant.fullName}`}
              >
                <span className="text-lg leading-none">
                  ⋯
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-40"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <DropdownMenuItem
                onSelect={() => {
                  meta.onView(item);
                }}
              >
                View
              </DropdownMenuItem>

              {item.status === "Pending" && (
                <DropdownMenuItem
                  onSelect={() => {
                    meta.onApprove(item);
                  }}
                >
                  Review
                </DropdownMenuItem>
              )}

              {item.status === "Pending" && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={() => {
                      meta.onReject(item);
                    }}
                    className="text-red-600 focus:bg-red-50 focus:text-red-600"
                  >
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];