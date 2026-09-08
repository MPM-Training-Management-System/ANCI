"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { WrittenAssessment } from "@repo/types";

export type AdminWrittenAssessment =
  WrittenAssessment;

export const columns: ColumnDef<AdminWrittenAssessment>[] = [
  {
    accessorKey: "title",
    header: "Assessment",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-semibold text-[#17191c]">
          {row.original.title}
        </p>

        {row.original.description && (
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {row.original.description}
          </p>
        )}
      </div>
    ),
  },

  {
    accessorKey: "batchCode",
    header: "Batch",
    cell: ({ row }) => (
      <span className="font-medium text-[#17191c]">
        {row.original.batchCode}
      </span>
    ),
  },

  {
    accessorKey: "questionCount",
    header: "Questions",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original.questionCount}
      </span>
    ),
  },

  {
    accessorKey: "passingPercentage",
    header: "Passing",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original.passingPercentage}%
      </span>
    ),
  },

  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) => {
      const published =
        row.original.isPublished;

      return (
        <span
          className={[
            "inline-flex rounded-full px-2.5 py-1",
            "text-[10px] font-semibold",
            published
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-600",
          ].join(" ")}
        >
          {published
            ? "Published"
            : "Draft"}
        </span>
      );
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const meta =
        table.options.meta as
          | {
              onQuestions?: (
                assessment: AdminWrittenAssessment,
              ) => void;
              onEdit?: (
                assessment: AdminWrittenAssessment,
              ) => void;
              onDelete?: (
                assessment: AdminWrittenAssessment,
              ) => void;
              onPublish?: (
                assessment: AdminWrittenAssessment,
              ) => void;
              deletingId?: string | null;
              publishingId?: string | null;
            }
          | undefined;

      const assessment =
        row.original;

      return (
        <div className="flex items-center gap-2">
          {meta?.onQuestions && (
            <button
              type="button"
              onClick={() =>
                meta.onQuestions?.(
                  assessment,
                )
              }
              className="
                rounded-lg
                border border-[#dfe2e6]
                px-3 py-1.5
                text-[11px] font-semibold
                text-gray-700
                transition
                hover:bg-gray-50
              "
            >
              Questions
            </button>
          )}

          {meta?.onEdit && (
            <button
              type="button"
              onClick={() =>
                meta.onEdit?.(
                  assessment,
                )
              }
              className="
                rounded-lg
                border border-[#dfe2e6]
                px-3 py-1.5
                text-[11px] font-semibold
                text-gray-700
                transition
                hover:bg-gray-50
              "
            >
              Edit
            </button>
          )}

          {meta?.onPublish && (
            <button
              type="button"
              disabled={
                meta.publishingId ===
                assessment.id
              }
              onClick={() =>
                meta.onPublish?.(
                  assessment,
                )
              }
              className="
                rounded-lg
                border border-[#dfe2e6]
                px-3 py-1.5
                text-[11px] font-semibold
                text-gray-700
                transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {meta.publishingId ===
              assessment.id
                ? "..."
                : assessment.isPublished
                  ? "Unpublish"
                  : "Publish"}
            </button>
          )}

          {meta?.onDelete && (
            <button
              type="button"
              disabled={
                meta.deletingId ===
                assessment.id
              }
              onClick={() =>
                meta.onDelete?.(
                  assessment,
                )
              }
              className="
                rounded-lg
                border border-red-200
                px-3 py-1.5
                text-[11px] font-semibold
                text-red-600
                transition
                hover:bg-red-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {meta.deletingId ===
              assessment.id
                ? "..."
                : "Delete"}
            </button>
          )}
        </div>
      );
    },
  },
];