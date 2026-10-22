
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { WrittenAssessment } from "@repo/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/index";

export type AdminWrittenAssessment = WrittenAssessment;

export interface WrittenAssessmentTableMeta {
  onQuestions?: (assessment: AdminWrittenAssessment) => void;
  onEdit?: (assessment: AdminWrittenAssessment) => void;
  onDelete?: (assessment: AdminWrittenAssessment) => void;
  onPublish?: (assessment: AdminWrittenAssessment) => void;
  deletingId?: string | null;
  publishingId?: string | null;
}

export const columns: ColumnDef<AdminWrittenAssessment>[] = [
  // ============================================================
  // ASSESSMENT
  // ============================================================
  {
    accessorKey: "title",
    header: "Assessment",

    cell: ({ row }) => {
      const assessment = row.original;

      return (
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#17191c]">
            {assessment.title || "Untitled Assessment"}
          </p>

          {assessment.description && (
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {assessment.description}
            </p>
          )}
        </div>
      );
    },
  },

  // ============================================================
  // BATCH
  // ============================================================
  {
    accessorKey: "batchCode",
    header: "Batch",

    cell: ({ row }) => (
      <span className="font-medium text-[#17191c]">
        {row.original.batchCode || "No batch code"}
      </span>
    ),
  },

  // ============================================================
  // QUESTIONS
  // ============================================================
  {
    accessorKey: "questionCount",
    header: "Questions",

    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original.questionCount ?? 0}
      </span>
    ),
  },

  // ============================================================
  // PASSING
  // ============================================================
  {
    accessorKey: "passingPercentage",
    header: "Passing",

    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original.passingPercentage ?? 0}%
      </span>
    ),
  },

  // ============================================================
  // STATUS
  // ============================================================
  {
    accessorKey: "isPublished",
    header: "Status",

    cell: ({ row }) => {
      const published = row.original.isPublished;

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
          {published ? "Published" : "Draft"}
        </span>
      );
    },
  },

  // ============================================================
  // ACTIONS DROPDOWN
  // ============================================================
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableColumnFilter: false,

    cell: ({ row, table }) => {
      const assessment = row.original;

      const meta = table.options.meta as
        | WrittenAssessmentTableMeta
        | undefined;

      if (!meta) {
        return null;
      }

      const isDeleting = meta.deletingId === assessment.id;
      const isPublishing = meta.publishingId === assessment.id;

      const hasActions =
        meta.onQuestions ||
        meta.onEdit ||
        meta.onPublish ||
        meta.onDelete;

      if (!hasActions) {
        return null;
      }

      return (
        <div
          className="flex items-center justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Actions for ${assessment.title || "assessment"}`}
              >
                <span className="text-lg leading-none">⋯</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-44"
              onClick={(event) => event.stopPropagation()}
            >
              {meta.onQuestions && (
                <DropdownMenuItem
                  onSelect={() => {
                    meta.onQuestions?.(assessment);
                  }}
                >
                  Questions
                </DropdownMenuItem>
              )}

              {meta.onEdit && (
                <DropdownMenuItem
                  onSelect={() => {
                    meta.onEdit?.(assessment);
                  }}
                >
                  Edit
                </DropdownMenuItem>
              )}

              {meta.onPublish && (
                <DropdownMenuItem
                  disabled={isPublishing}
                  onSelect={() => {
                    meta.onPublish?.(assessment);
                  }}
                >
                  {isPublishing
                    ? "Please wait..."
                    : assessment.isPublished
                      ? "Unpublish"
                      : "Publish"}
                </DropdownMenuItem>
              )}

              {meta.onDelete && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={isDeleting}
                    onSelect={() => {
                      meta.onDelete?.(assessment);
                    }}
                    className="text-red-600 focus:bg-red-50 focus:text-red-600"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
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
