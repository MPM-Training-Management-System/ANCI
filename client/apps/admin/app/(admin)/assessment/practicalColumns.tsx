"use client";

import type {
  PracticalAssessment,
} from "@repo/types";

export type AdminPracticalAssessment =
  PracticalAssessment;

interface PracticalColumnsMeta {
  onEdit?: (
    assessment: PracticalAssessment,
  ) => void;

  onDelete?: (
    assessment: PracticalAssessment,
  ) => void;

  onPublish?: (
    assessment: PracticalAssessment,
  ) => void;

  deletingId?: string | null;

  publishingId?: string | null;
}

export const practicalColumns = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({
      row,
    }: {
      row: {
        original: PracticalAssessment;
      };
    }) => (
      <div>
        <p className="font-semibold text-[#111827]">
          {row.original.title}
        </p>

        {row.original.description && (
          <p className="mt-1 max-w-md truncate text-xs text-gray-400">
            {row.original.description}
          </p>
        )}
      </div>
    ),
  },

  {
    accessorKey: "criteria",
    header: "Criteria",
    cell: ({
      row,
    }: {
      row: {
        original: PracticalAssessment;
      };
    }) => (
      <span
        className="
          rounded-full
          bg-gray-100
          px-2.5
          py-1
          text-xs
          font-semibold
          text-gray-600
        "
      >
        {row.original.criteria?.length ?? 0}
      </span>
    ),
  },

  {
    accessorKey: "passingPercentage",
    header: "Passing",
    cell: ({
      row,
    }: {
      row: {
        original: PracticalAssessment;
      };
    }) => (
      <span className="text-sm font-semibold text-gray-700">
        {row.original.passingPercentage}%
      </span>
    ),
  },

  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({
      row,
    }: {
      row: {
        original: PracticalAssessment;
      };
    }) => (
      <span
        className={`
          inline-flex
          rounded-full
          border
          px-2.5
          py-1
          text-[10px]
          font-bold
          ${
            row.original.isPublished
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-gray-200 bg-gray-50 text-gray-500"
          }
        `}
      >
        {row.original.isPublished
          ? "Published"
          : "Draft"}
      </span>
    ),
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({
      row,
      table,
    }: {
      row: {
        original: PracticalAssessment;
      };
      table: {
        options: {
          meta?: PracticalColumnsMeta;
        };
      };
    }) => {
      const assessment =
        row.original;

      const meta =
        table.options.meta;

      const isDeleting =
        meta?.deletingId ===
        assessment.id;

      const isPublishing =
        meta?.publishingId ===
        assessment.id;

      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              meta?.onEdit?.(assessment)
            }
            disabled={
              isDeleting ||
              isPublishing
            }
            className="
              rounded-lg
              border
              border-gray-200
              px-3
              py-1.5
              text-xs
              font-semibold
              text-gray-700
              hover:bg-gray-50
              disabled:opacity-50
            "
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              meta?.onPublish?.(
                assessment,
              )
            }
            disabled={
              isDeleting ||
              isPublishing
            }
            className="
              rounded-lg
              border
              border-gray-200
              px-3
              py-1.5
              text-xs
              font-semibold
              text-gray-700
              hover:bg-gray-50
              disabled:opacity-50
            "
          >
            {isPublishing
              ? "..."
              : assessment.isPublished
                ? "Unpublish"
                : "Publish"}
          </button>

          <button
            type="button"
            onClick={() =>
              meta?.onDelete?.(
                assessment,
              )
            }
            disabled={
              isDeleting ||
              isPublishing
            }
            className="
              rounded-lg
              border
              border-red-200
              px-3
              py-1.5
              text-xs
              font-semibold
              text-red-600
              hover:bg-red-50
              disabled:opacity-50
            "
          >
            {isDeleting
              ? "..."
              : "Delete"}
          </button>
        </div>
      );
    },
  },
];