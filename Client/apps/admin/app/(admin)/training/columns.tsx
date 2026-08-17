"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Badge,
  RowActions,
} from "@repo/ui/index";

import {
  Eye,
  Pencil,
  Trash2,
  UserRoundPlus,
} from "lucide-react";

import type { MockTraining } from "./mockData";

interface TrainingColumnsProps {
  onView: (training: MockTraining) => void;
  onAssignTrainer: (training: MockTraining) => void;
  onEdit: (training: MockTraining) => void;
  onDelete: (training: MockTraining) => void;
}

export const createColumns = ({
  onView,
  onAssignTrainer,
  onEdit,
  onDelete,
}: TrainingColumnsProps): ColumnDef<MockTraining>[] => [
  {
    accessorKey: "title",
    header: "Program Name",

    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#002B5C]/10 text-[#002B5C]">
          <span className="material-symbols-outlined text-[20px]">
            school
          </span>
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-[#002B5C]">
            {row.original.title}
          </p>

          <p className="text-xs text-gray-400">
            ID: {row.original.id}
          </p>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "category",
    header: "Category",

    cell: ({ row }) => {
      const category = row.original.category;

      const styles = {
        Mediation:
          "bg-[#48A9C5]/10 text-[#00677D]",
        Governance:
          "bg-[#002B5C]/10 text-[#002B5C]",
        Sports:
          "bg-[#D4AF37]/15 text-[#735C00]",
      };

      return (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[category]}`}
        >
          {category}
        </span>
      );
    },
  },

  {
    id: "trainer",
    header: "Trainer",

    cell: ({ row }) => {
      const training = row.original;

      if (!training.trainerName) {
        return (
          <button
            type="button"
            onClick={() =>
              onAssignTrainer(training)
            }
            className="flex items-center gap-2 text-sm font-medium text-[#00677D] transition hover:text-[#002B5C] hover:underline"
          >
            <UserRoundPlus className="h-4 w-4" />
            Assign Trainer
          </button>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#002B5C] text-white">
            <span className="text-xs font-semibold">
              {training.trainerName
                .split(" ")
                .map((name) => name[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              {training.trainerName}
            </p>

            <p className="text-xs text-gray-400">
              Assigned Trainer
            </p>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "enrolled",
    header: "Enrollment",

    cell: ({ row }) => {
      const {
        enrolled,
        capacity,
      } = row.original;

      const percentage =
        capacity > 0
          ? Math.round(
              (enrolled / capacity) * 100
            )
          : 0;

      return (
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap text-sm text-gray-700">
            {enrolled}/{capacity}
          </span>

          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#48A9C5]"
              style={{
                width: `${Math.min(
                  percentage,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      );
    },
  },

  {
    id: "period",
    header: "Training Period",

    cell: ({ row }) => {
      const start = new Date(
        row.original.startDate
      );

      const end = new Date(
        row.original.endDate
      );

      const formatDate = (
        date: Date
      ) =>
        date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        );

      return (
        <div>
          <p className="text-sm font-medium text-gray-700">
            {formatDate(start)}
          </p>

          <p className="text-xs text-gray-400">
            to {formatDate(end)}
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Status",

    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            row.original.status
              ? "bg-green-500"
              : "bg-gray-400"
          }`}
        />

        <Badge
          variant={
            row.original.status
              ? "active"
              : "inactive"
          }
        >
          {row.original.status
            ? "Active"
            : "Inactive"}
        </Badge>
      </div>
    ),
  },

  {
    id: "actions",
    header: "Actions",

    cell: ({ row }) => {
      const training = row.original;

      return (
        <RowActions
          actions={[
            {
              label: "View Details",
              icon: (
                <Eye className="h-4 w-4" />
              ),
              onClick: () =>
                onView(training),
            },
            {
              label: training.trainerId
                ? "Change Trainer"
                : "Assign Trainer",
              icon: (
                <UserRoundPlus className="h-4 w-4" />
              ),
              onClick: () =>
                onAssignTrainer(training),
            },
            {
              label: "Edit Program",
              icon: (
                <Pencil className="h-4 w-4" />
              ),
              onClick: () =>
                onEdit(training),
            },
            {
              label: "Delete Program",
              icon: (
                <Trash2 className="h-4 w-4" />
              ),
              danger: true,
              onClick: () =>
                onDelete(training),
            },
          ]}
        />
      );
    },
  },
];