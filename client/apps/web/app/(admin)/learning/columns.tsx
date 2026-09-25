"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  LearningMaterial,
  TrainingBatch,
} from "@repo/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
} from "@repo/ui/index";


// ============================================================
// TABLE META
// ============================================================

export interface LearningMaterialTableMeta {
  batchMap: Map<string, TrainingBatch>;

  onView: (material: LearningMaterial) => void;
  onPublish: (material: LearningMaterial) => void;
  onDelete: (material: LearningMaterial) => void;
}


// ============================================================
// MATERIAL TYPE
// ============================================================

type MaterialType =
  | "PDF"
  | "Presentation"
  | "Document"
  | "Video"
  | "Activity"
  | "Other";


// ============================================================
// COLUMNS
// ============================================================

export const columns: ColumnDef<LearningMaterial>[] = [

  /*
   * ============================================================
   * LEARNING MATERIAL
   * ============================================================
   */

  {
    accessorKey: "title",
    header: "Learning Material",

    cell: ({ row }) => {
      const material = row.original;
      const type = getMaterialType(
        material.materialType,
      );

      const styles = getTypeStyles(type);

      return (
        <div className="flex items-center gap-3">

          {/* TYPE ICON */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[9px] font-bold ${styles}`}
          >
            {getTypeLabel(type)}
          </div>

          {/* MATERIAL INFO */}
          <div className="min-w-0">

            <p className="max-w-[270px] truncate text-sm font-semibold text-gray-900">
              {material.title}
            </p>

            <p className="mt-0.5 max-w-[270px] truncate font-mono text-[10px] text-gray-400">
              {material.fileName ?? "No file uploaded"}
            </p>

          </div>

        </div>
      );
    },
  },


  /*
   * ============================================================
   * TRAINING
   * ============================================================
   */

  {
    id: "training",
    header: "Training",

    accessorFn: (row) => row.trainingBatchId,

    cell: ({ row, table }) => {
      const material = row.original;

      const meta =
        table.options.meta as
          | LearningMaterialTableMeta
          | undefined;

      const batch =
        meta?.batchMap.get(
          material.trainingBatchId,
        );

      return (
        <p className="max-w-[220px] text-xs font-semibold leading-5">
          {batch?.programName ?? "Unknown Training"}
        </p>
      );
    },
  },


  /*
   * ============================================================
   * BATCH
   * ============================================================
   */

  {
    accessorKey: "batchCode",
    header: "Batch",

    cell: ({ row, table }) => {
      const material = row.original;

      const meta =
        table.options.meta as
          | LearningMaterialTableMeta
          | undefined;

      const batch =
        meta?.batchMap.get(
          material.trainingBatchId,
        );

      return (
        <div>

          <p className="font-mono text-xs font-semibold text-gray-700">
            {material.batchCode ??
              batch?.batchCode ??
              "—"}
          </p>

          <p className="mt-0.5 text-[10px] text-gray-400">
            {formatDate(material.createdAt)}
          </p>

        </div>
      );
    },
  },


  /*
   * ============================================================
   * TYPE
   * ============================================================
   */

  {
    accessorKey: "materialType",
    header: "Type",

    cell: ({ row }) => {
      return (
        <span className="text-xs font-semibold text-gray-700">
          {getMaterialType(
            row.original.materialType,
          )}
        </span>
      );
    },
  },


  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  {
    id: "status",
    header: "Status",

    accessorFn: (row) =>
      row.isPublished
        ? "Published"
        : "Draft",

    cell: ({ row }) => {
      const published =
        row.original.isPublished;

      return (
        <Badge
          variant={
            published
              ? "success"
              : "warning"
          }
        >
          {published
            ? "Published"
            : "Draft"}
        </Badge>
      );
    },
  },


  /*
   * ============================================================
   * ACTIONS
   * ============================================================
   */

  {
    id: "actions",

    header: "Actions",

    enableSorting: false,
    enableColumnFilter: false,

    cell: ({ row, table }) => {
      const material = row.original;

      const meta =
        table.options.meta as
          | LearningMaterialTableMeta
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
                aria-label={`Actions for ${material.title}`}
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
                  meta.onView(material);
                }}
              >
                View
              </DropdownMenuItem>


              {!material.isPublished && (
                <DropdownMenuItem
                  onSelect={() => {
                    meta.onPublish(material);
                  }}
                >
                  Publish
                </DropdownMenuItem>
              )}


              <DropdownMenuSeparator />


              <DropdownMenuItem
                onSelect={() => {
                  meta.onDelete(material);
                }}
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>
      );
    },
  },
];


// ============================================================
// MATERIAL TYPE HELPERS
// ============================================================

function getMaterialType(
  value: string,
): MaterialType {

  const type =
    value
      .trim()
      .toLowerCase();

  if (type === "pdf") {
    return "PDF";
  }

  if (
    type === "presentation" ||
    type === "ppt" ||
    type === "pptx"
  ) {
    return "Presentation";
  }

  if (
    type === "document" ||
    type === "doc" ||
    type === "docx"
  ) {
    return "Document";
  }

  if (
    type === "video" ||
    type === "mp4"
  ) {
    return "Video";
  }

  if (type === "activity") {
    return "Activity";
  }

  return "Other";
}


// ============================================================
// TYPE LABEL
// ============================================================

function getTypeLabel(
  type: MaterialType,
) {

  switch (type) {
    case "PDF":
      return "PDF";

    case "Presentation":
      return "PPT";

    case "Document":
      return "DOC";

    case "Video":
      return "VID";

    case "Activity":
      return "ACT";

    default:
      return "FILE";
  }
}


// ============================================================
// TYPE STYLES
// ============================================================

function getTypeStyles(
  type: MaterialType,
) {

  switch (type) {
    case "PDF":
      return "bg-red-50 text-red-600 border-red-100";

    case "Presentation":
      return "bg-orange-50 text-orange-600 border-orange-100";

    case "Document":
      return "bg-blue-50 text-blue-600 border-blue-100";

    case "Video":
      return "bg-purple-50 text-purple-600 border-purple-100";

    case "Activity":
      return "bg-emerald-50 text-emerald-600 border-emerald-100";

    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}


// ============================================================
// DATE
// ============================================================

function formatDate(
  value: string | null | undefined,
) {

  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}
