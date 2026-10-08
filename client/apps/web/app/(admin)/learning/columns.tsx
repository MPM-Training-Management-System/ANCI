"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  LearningModule,
  TrainingBatch,
} from "@repo/types";

import {
  Badge,
  Button,
} from "@repo/ui/index";

import {
  Settings2,
  Eye,
  FileCog,
  FileSearch,
  Trash2,
} from "lucide-react";

// ============================================================
// TABLE ROW
// ============================================================

export interface TrainerLearningModuleRow {
  module: LearningModule;
  batch: TrainingBatch | null;
  lessonCount: number;
}

// ============================================================
// TABLE META
// ============================================================

export interface TrainerLearningModuleTableMeta {
  onManage: (
    row: TrainerLearningModuleRow,
  ) => void;

  onOpenMaterial: (
    row: TrainerLearningModuleRow,
  ) => void;

  onReplaceMaterial: (
    row: TrainerLearningModuleRow,
  ) => void;

  onExtractMaterial: (
    row: TrainerLearningModuleRow,
  ) => void;

  onDeleteModule: (
    row: TrainerLearningModuleRow,
  ) => void;
}

// ============================================================
// COLUMNS
// ============================================================

export const columns: ColumnDef<TrainerLearningModuleRow>[] = [

  // ==========================================================
  // MODULE
  // ==========================================================

  {
    id: "module",

    accessorFn: (row) =>
      row.module.title,

    header: "Module",

    cell: ({ row }) => {
      const module =
        row.original.module;

      return (
        <div className="flex items-center gap-3">

          {/* MODULE NUMBER */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dbe5ef] bg-[#f4f8fb] text-xs font-bold text-[#002b5c]">
            {module.moduleNumber}
          </div>

          {/* MODULE INFO */}
          <div className="min-w-0">

            <p className="max-w-[300px] truncate text-sm font-semibold text-gray-900">
              {module.title}
            </p>

            <p className="mt-0.5 text-[10px] text-gray-400">
              Module {module.moduleNumber}
            </p>

          </div>

        </div>
      );
    },
  },

  // ==========================================================
  // TRAINING
  // ==========================================================

  {
    id: "training",

    header: "Training",

    accessorFn: (row) =>
      row.batch?.programName ?? "",

    cell: ({ row }) => {
      const batch =
        row.original.batch;

      return (
        <div>

          <p className="max-w-[220px] truncate text-xs font-semibold text-gray-800">
            {batch?.programName ??
              "Unknown Training"}
          </p>

          <p className="mt-0.5 font-mono text-[10px] text-gray-400">
            {batch?.batchCode ??
              "No batch"}
          </p>

        </div>
      );
    },
  },

  // ==========================================================
  // LESSONS
  // ==========================================================

  {
    id: "lessons",

    header: "Lessons",

    accessorFn: (row) =>
      row.lessonCount,

    cell: ({ row }) => {
      const count =
        row.original.lessonCount;

      return (
        <span className="text-xs font-semibold text-gray-700">
          {count}{" "}
          {count === 1
            ? "lesson"
            : "lessons"}
        </span>
      );
    },
  },

  // ==========================================================
  // STATUS
  // ==========================================================

  {
    id: "status",

    header: "Status",

    accessorFn: (row) => {
      const module =
        row.module;

      const hasContent =
        Boolean(
          module.welcomeContent ||
          module.learningObjectives ||
          module.summary ||
          module.keyTakeaways,
        );

      return hasContent
        ? "Ready"
        : "Draft";
    },

    cell: ({ row }) => {
      const module =
        row.original.module;

      const hasContent =
        Boolean(
          module.welcomeContent ||
          module.learningObjectives ||
          module.summary ||
          module.keyTakeaways,
        );

      return (
        <Badge
          variant={
            hasContent
              ? "success"
              : "warning"
          }
        >
          {hasContent
            ? "Ready"
            : "Draft"}
        </Badge>
      );
    },
  },

  // ==========================================================
  // ACTIONS
  // ==========================================================

  {
    id: "actions",

    header: "Action",

    enableSorting: false,
    enableColumnFilter: false,

    cell: ({
      row,
      table,
    }) => {
      const meta =
        table.options.meta as
          | TrainerLearningModuleTableMeta
          | undefined;

      if (!meta) {
        return null;
      }

      return (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >

          {/* ==================================================
              MANAGE
          ================================================== */}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl border-slate-200 px-3 text-xs font-semibold"
            title="Manage module"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              meta.onManage(
                row.original,
              );
            }}
          >
            <Settings2 className="h-4 w-4" />

            Manage
          </Button>


          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
            title="Delete module"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              meta.onDeleteModule(
                row.original,
              );
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />

            Delete
          </Button>

        </div>
      );
    },
  },
];