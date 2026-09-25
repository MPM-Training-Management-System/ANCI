"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/index";

import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

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

      header: "",

      enableSorting: false,

      enableGlobalFilter: false,

      cell: ({ row, table }) => {
        const program = row.original;

        const meta =
          table.options.meta as
            | TrainingProgramTableMeta
            | undefined;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e7e9ec] bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                  aria-label={`Actions for ${program.title}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-44"
              >
                {/* VIEW */}
                <DropdownMenuItem
                  onClick={() =>
                    meta?.onView?.(program)
                  }
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Eye className="h-4 w-4 text-gray-500" />

                  <span>View</span>
                </DropdownMenuItem>

                {/* MANAGE */}
                <DropdownMenuItem
                  onClick={() =>
                    meta?.onManage?.(program)
                  }
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Pencil className="h-4 w-4 text-gray-500" />

                  <span>Manage</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* DELETE */}
                <DropdownMenuItem
                  onClick={() =>
                    meta?.onDelete?.(program)
                  }
                  className="cursor-pointer gap-2 text-xs text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />

                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];