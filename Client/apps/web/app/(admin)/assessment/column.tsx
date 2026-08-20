"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge, UserCell } from "@repo/ui/index";

export type AssessmentType =
  | "Written Exam"
  | "Practical Assessment";

export type AssessmentStatus =
  | "Draft"
  | "Published";

export type TrainingOption = {
  name: string;
  code: string;
};

export type Question = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  points: number;
};

export type Criterion = {
  id: string;
  name: string;
  description: string;
  maxScore: number;
};

export type Assessment = {
  id: string;

  title: string;
  description: string;

  training: string;
  trainingCode: string;

  type: AssessmentType;
  status: AssessmentStatus;

  passingScore: number;
  duration: number;
  attemptsAllowed: number;

  instructions: string;

  questions: Question[];
  criteria: Criterion[];

  createdAt: string;
  updatedAt: string;
};

export type AssessmentTableMeta = {
  onContent?: (assessment: Assessment) => void;

  onPreview?: (assessment: Assessment) => void;

  onSettings?: (assessment: Assessment) => void;

  onTogglePublish?: (
    assessment: Assessment,
  ) => void;

  onDelete?: (assessment: Assessment) => void;
};

export const columns: ColumnDef<
  Assessment
>[] = [
  {
    accessorKey: "title",

    header: "Assessment",

    cell: ({ row }) => {
      const assessment = row.original;

      const isWritten =
        assessment.type === "Written Exam";

      return (
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
              isWritten
                ? "bg-violet-50 text-violet-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {isWritten ? "Q" : "P"}
          </div>

          <div className="max-w-[330px]">
            <p className="truncate text-xs font-semibold">
              {assessment.title}
            </p>

            <p className="mt-1 truncate text-[10px] text-gray-400">
              {assessment.id} ·{" "}
              {assessment.trainingCode}
            </p>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "type",

    header: "Type",

    cell: ({ row }) => {
      const assessment = row.original;

      return (
        <span
          className={`inline-flex rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${
            assessment.type === "Written Exam"
              ? "bg-violet-50 text-violet-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {assessment.type}
        </span>
      );
    },
  },

  {
    id: "content",

    header: "Content",

    cell: ({ row }) => {
      const assessment = row.original;

      const count =
        assessment.type === "Written Exam"
          ? assessment.questions.length
          : assessment.criteria.length;

      const label =
        assessment.type === "Written Exam"
          ? "questions"
          : "criteria";

      return (
        <div>
          <p className="text-sm font-bold">
            {count}
          </p>

          <p className="mt-1 text-[9px] text-gray-400">
            {label}
          </p>
        </div>
      );
    },
  },

  {
    accessorKey: "passingScore",

    header: "Passing",

    cell: ({ row }) => (
      <span className="text-sm font-bold">
        {row.original.passingScore}%
      </span>
    ),
  },

  {
    accessorKey: "duration",

    header: "Duration",

    cell: ({ row }) => (
      <span className="text-xs text-gray-600">
        {row.original.duration} min
      </span>
    ),
  },

  {
    accessorKey: "status",

    header: "Status",

    cell: ({ row }) => {
      const status =
        row.original.status;

      return (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${
            status === "Published"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {status}
        </span>
      );
    },
  },

  {
    id: "actions",

    header: "Actions",

    cell: ({ row, table }) => {
      const assessment =
        row.original;

      const meta =
        table.options.meta as
          | AssessmentTableMeta
          | undefined;

      return (
        <div className="flex justify-end gap-1.5">

          {/* CONTENT */}

          <button
            type="button"
            onClick={() =>
              meta?.onContent?.(
                assessment,
              )
            }
            className="rounded-lg bg-[#191c1e] px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90"
          >
            Content
          </button>

          {/* PREVIEW */}

          <button
            type="button"
            onClick={() =>
              meta?.onPreview?.(
                assessment,
              )
            }
            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Preview
          </button>

          {/* SETTINGS */}

          <button
            type="button"
            onClick={() =>
              meta?.onSettings?.(
                assessment,
              )
            }
            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Settings
          </button>

          {/* PUBLISH */}

          <button
            type="button"
            onClick={() =>
              meta?.onTogglePublish?.(
                assessment,
              )
            }
            className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition ${
              assessment.status ===
              "Published"
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {assessment.status ===
            "Published"
              ? "Unpublish"
              : "Publish"}
          </button>

          {/* DELETE */}

          <button
            type="button"
            onClick={() =>
              meta?.onDelete?.(
                assessment,
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