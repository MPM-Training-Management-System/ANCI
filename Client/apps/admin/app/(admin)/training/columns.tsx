"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@repo/ui/index";

export type ProgramStatus =
  | "Active"
  | "Draft"
  | "Archived";

export type Requirement = {
  id: string;
  name: string;
  description: string;
  required: boolean;
};

export type TrainingProgram = {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  hours: number;
  capacity: number;
  enrolled: number;
  schedule: string;
  location: string;
  trainer: string;
  status: ProgramStatus;
  requirements: Requirement[];
  createdAt: string;
};

export type TrainingProgramTableMeta = {
  onView?: (
    program: TrainingProgram,
  ) => void;

  onManage?: (
    program: TrainingProgram,
  ) => void;

  onDelete?: (
    program: TrainingProgram,
  ) => void;
};

export const columns: ColumnDef<TrainingProgram>[] =
  [
    // =====================================================
    // TRAINING PROGRAM
    // =====================================================

    {
      accessorKey: "title",

      header: "Training Program",

      cell: ({ row }) => {
        const program = row.original;

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#191c1e] text-[10px] font-bold text-white">
              {program.code
                .slice(0, 3)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="max-w-[240px] truncate text-xs font-semibold text-gray-800">
                {program.title}
              </p>

              <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                {program.code}
              </p>
            </div>
          </div>
        );
      },
    },

    // =====================================================
    // CATEGORY
    // =====================================================

    {
      accessorKey: "category",

      header: "Category",

      cell: ({ row }) => (
        <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[10px] font-semibold text-gray-600">
          {row.original.category}
        </span>
      ),
    },

    // =====================================================
    // SCHEDULE
    // =====================================================

    {
      accessorKey: "schedule",

      header: "Schedule",

      cell: ({ row }) => {
        const program = row.original;

        return (
          <div className="min-w-[180px]">
            <p className="text-xs font-medium">
              {program.duration}
            </p>

            <p className="mt-0.5 text-[10px] leading-4 text-gray-400">
              {program.schedule}
            </p>
          </div>
        );
      },
    },

    // =====================================================
    // CAPACITY
    // =====================================================

    {
      accessorKey: "enrolled",

      header: "Capacity",

      cell: ({ row }) => {
        const program = row.original;

        const percentage =
          program.capacity === 0
            ? 0
            : Math.round(
                (program.enrolled /
                  program.capacity) *
                  100,
              );

        return (
          <div className="w-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">
                {program.enrolled}/
                {program.capacity}
              </span>

              <span className="text-[10px] text-gray-400">
                {percentage}%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${
                  percentage >= 100
                    ? "bg-red-500"
                    : percentage >= 80
                      ? "bg-amber-500"
                      : "bg-[#191c1e]"
                }`}
                style={{
                  width: `${Math.min(
                    percentage,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        );
      },
    },

    // =====================================================
    // TRAINER
    // =====================================================

    {
      accessorKey: "trainer",

      header: "Trainer",

      cell: ({ row }) => (
        <span className="text-xs font-semibold">
          {row.original.trainer}
        </span>
      ),
    },

    // =====================================================
    // STATUS
    // =====================================================

    {
      accessorKey: "status",

      header: "Status",

      cell: ({ row }) => {
        const status =
          row.original.status;

        return (
          <Badge
            variant={
              status === "Active"
                ? "active"
                : status === "Draft"
                  ? "warning"
                  : "inactive"
            }
          >
            {status}
          </Badge>
        );
      },
    },

    // =====================================================
    // ACTIONS
    // =====================================================

    {
      id: "actions",

      header: "Actions",

      enableSorting: false,

      enableGlobalFilter: false,

      cell: ({ row, table }) => {
        const program =
          row.original;

        const meta =
          table.options.meta as
            | TrainingProgramTableMeta
            | undefined;

        return (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                meta?.onView?.(
                  program,
                )
              }
              className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              View
            </button>

            <button
              type="button"
              onClick={() =>
                meta?.onManage?.(
                  program,
                )
              }
              className="rounded-lg bg-[#191c1e] px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90"
            >
              Manage
            </button>

            <button
              type="button"
              onClick={() =>
                meta?.onDelete?.(
                  program,
                )
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