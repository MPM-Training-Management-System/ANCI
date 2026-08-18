"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge, UserCell } from "@repo/ui/index";

import type {
  LearningMaterial,
  MaterialType,
  MaterialStatus,
} from "./types";




export interface LearningMaterialsTableMeta {
  onView: (material: LearningMaterial) => void;
  onEdit: (material: LearningMaterial) => void;
  onTogglePublish: (
    material: LearningMaterial,
  ) => void;
  onDelete: (material: LearningMaterial) => void;
}

/*
|--------------------------------------------------------------------------
| TYPE HELPERS
|--------------------------------------------------------------------------
*/

function getTypeIcon(type: MaterialType) {
  switch (type) {
    case "Module":
      return "M";

    case "Presentation":
      return "P";

    case "Video":
      return "▶";

    case "Document":
      return "D";

    case "Link":
      return "↗";

    default:
      return "•";
  }
}

function getTypeStyle(type: MaterialType) {
  switch (type) {
    case "Module":
      return "bg-violet-50 text-violet-700";

    case "Presentation":
      return "bg-orange-50 text-orange-700";

    case "Video":
      return "bg-red-50 text-red-700";

    case "Document":
      return "bg-blue-50 text-blue-700";

    case "Link":
      return "bg-cyan-50 text-cyan-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

/*
|--------------------------------------------------------------------------
| COLUMNS
|--------------------------------------------------------------------------
*/

export const columns: ColumnDef<LearningMaterial>[] = [
  /*
  |--------------------------------------------------------------------------
  | MATERIAL
  |--------------------------------------------------------------------------
  */

  {
    accessorKey: "title",

    header: "Material",

    cell: ({ row }) => {
      const material = row.original;

      return (
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${getTypeStyle(
              material.type,
            )}`}
          >
            {getTypeIcon(
              material.type,
            )}
          </div>

          <div className="max-w-[330px]">
            <p className="truncate text-xs font-semibold text-[#191c1e]">
              {material.title}
            </p>

            <p className="mt-1 truncate text-[10px] text-gray-400">
              {material.description}
            </p>
          </div>
        </div>
      );
    },
  },

  /*
  |--------------------------------------------------------------------------
  | TYPE
  |--------------------------------------------------------------------------
  */

  {
    accessorKey: "type",

    header: "Type",

    cell: ({ row }) => {
      const material = row.original;

      return (
        <span
          className={`rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${getTypeStyle(
            material.type,
          )}`}
        >
          {material.type}
        </span>
      );
    },
  },

  /*
  |--------------------------------------------------------------------------
  | FILE
  |--------------------------------------------------------------------------
  */

  {
    accessorKey: "fileName",

    header: "File",

    cell: ({ row }) => {
      const material = row.original;

      return (
        <div>
          <p className="max-w-[190px] truncate text-[10px] font-medium text-gray-600">
            {material.fileName}
          </p>

          <p className="mt-1 text-[9px] text-gray-400">
            {material.fileSize}
          </p>
        </div>
      );
    },
  },

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  {
    accessorKey: "status",

    header: "Status",

    cell: ({ row }) => {
      const material = row.original;

      return (
        <Badge
          variant={
            material.status ===
            "Published"
              ? "active"
              : "pending"
          }
        >
          {material.status}
        </Badge>
      );
    },
  },

  /*
  |--------------------------------------------------------------------------
  | UPDATED
  |--------------------------------------------------------------------------
  */

  {
    accessorKey: "updatedAt",

    header: "Updated",

    cell: ({ row }) => {
      return (
        <span className="text-[10px] text-gray-500">
          {row.original.updatedAt}
        </span>
      );
    },
  },

  /*
  |--------------------------------------------------------------------------
  | ACTIONS
  |--------------------------------------------------------------------------
  */

  {
    id: "actions",

    header: "Actions",

    cell: ({ row, table }) => {
      const material =
        row.original;

      const meta =
        table.options.meta as
          | LearningMaterialsTableMeta
          | undefined;

      return (
        <div className="flex justify-end gap-1.5">
          {/* VIEW */}

          <button
            type="button"
            onClick={() =>
              meta?.onView(material)
            }
            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            View
          </button>

          {/* EDIT */}

          <button
            type="button"
            onClick={() =>
              meta?.onEdit(material)
            }
            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Edit
          </button>

          {/* PUBLISH / UNPUBLISH */}

          <button
            type="button"
            onClick={() =>
              meta?.onTogglePublish(
                material,
              )
            }
            className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${
              material.status ===
              "Published"
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {material.status ===
            "Published"
              ? "Unpublish"
              : "Publish"}
          </button>

          {/* DELETE */}

          <button
            type="button"
            onClick={() =>
              meta?.onDelete(material)
            }
            className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      );
    },
  },
];