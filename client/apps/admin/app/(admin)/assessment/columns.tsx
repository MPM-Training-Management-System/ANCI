"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Badge,
  UserCell,
} from "@repo/ui/index";

import type {
  Assessment,
  AssessmentTableMeta,
} from "./types";

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const columns: ColumnDef<Assessment>[] = [
  {
    accessorKey: "participantName",

    header: "Participant",

    cell: ({ row }) => {
      const participant = row.original;

      return (
        <UserCell
          name={participant.participantName}
          email={participant.participantId}
        />
      );
    },
  },

  {
    accessorKey: "training",

    header: "Training",

    cell: ({ row }) => {
      const assessment = row.original;

      return (
        <div>
          <p className="max-w-[220px] font-medium">
            {assessment.training}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {assessment.batch}
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "assessment",

    header: "Assessment",

    cell: ({ row }) => {
      const assessment = row.original;

      return (
        <div>
          <p className="max-w-[240px] font-medium">
            {assessment.assessment}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {assessment.type}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {formatDate(assessment.date)}
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "score",

    header: "Score",

    cell: ({ row }) => {
      const score = row.original.score;

      if (score === null) {
        return (
          <span className="text-sm text-gray-400">
            Pending
          </span>
        );
      }

      return (
        <span className="text-lg font-bold">
          {score}

          <span className="ml-1 text-xs font-normal text-gray-400">
            / 100
          </span>
        </span>
      );
    },
  },

  {
    accessorKey: "result",

    header: "Result",

    cell: ({ row }) => {
      const result =
        row.original.result;

      return (
        <Badge
          variant={
            result === "Passed"
              ? "success"
              : result === "Failed"
                ? "error"
                : "warning"
          }
        >
          {result}
        </Badge>
      );
    },
  },

  {
    accessorKey: "status",

    header: "Status",

    cell: ({ row }) => {
      const assessment = row.original;

      return (
        <div className="space-y-1">
          <Badge
            variant={
              assessment.status ===
              "Completed"
                ? "success"
                : assessment.status ===
                    "Pending"
                  ? "warning"
                  : assessment.status ===
                      "Retake Required"
                    ? "error"
                    : "neutral"
            }
          >
            {assessment.status}
          </Badge>

          {assessment.retakeDate && (
            <p className="text-xs text-gray-500">
              Retake:{" "}
              {formatDate(
                assessment.retakeDate
              )}
            </p>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "trainer",

    header: "Trainer",

    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {row.original.trainer}
        </span>
      );
    },
  },

  {
    accessorKey: "attempts",

    header: "Attempts",

    cell: ({ row }) => {
      const assessment = row.original;

      return (
        <span>
          <strong>
            {assessment.attempts}
          </strong>

          <span className="text-gray-400">
            {" "}
            / {assessment.maxAttempts}
          </span>
        </span>
      );
    },
  },

  {
    id: "actions",

    header: "Actions",

    cell: ({ row, table }) => {
      const assessment = row.original;

      const meta =
        table.options.meta as
          | AssessmentTableMeta
          | undefined;

      const canManage =
        assessment.status ===
          "Retake Required" ||
        assessment.status ===
          "Retake Scheduled" ||
        assessment.status ===
          "Pending";

      return (
        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() =>
              meta?.onView?.(
                assessment
              )
            }
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold transition hover:bg-gray-50"
          >
            View
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() =>
                meta?.onManage?.(
                  assessment
                )
              }
              className="rounded-lg bg-[#191c1e] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Manage
            </button>
          )}

        </div>
      );
    },
  },
];