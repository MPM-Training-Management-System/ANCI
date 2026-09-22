"use client";

import type {
  PracticalAssessment,
  WrittenAssessment,
} from "@repo/types";

import {
  columns,
  type AdminWrittenAssessment,
} from "./columns";

import {
  practicalColumns,
  type AdminPracticalAssessment,
} from "./practicalColumns";

import { DataTable } from "@repo/ui/index";

interface AssessmentTableProps {
  assessmentType: "written" | "practical";

  assessments:
    | WrittenAssessment[]
    | PracticalAssessment[];

  isLoading: boolean;

  deletingId: string | null;
  publishingId: string | null;

  onEditWritten: (
    assessment: WrittenAssessment,
  ) => void;

  onEditPractical: (
    assessment: PracticalAssessment,
  ) => void;

  onDeleteWritten: (
    assessment: WrittenAssessment,
  ) => void;

  onDeletePractical: (
    assessment: PracticalAssessment,
  ) => void;

  onPublishWritten: (
    assessment: WrittenAssessment,
  ) => void;

  onPublishPractical: (
    assessment: PracticalAssessment,
  ) => void;

  onQuestions: (
    assessment: WrittenAssessment,
  ) => void;
}

export default function AssessmentTable({
  assessmentType,
  assessments,
  isLoading,
  deletingId,
  publishingId,
  onEditWritten,
  onEditPractical,
  onDeleteWritten,
  onDeletePractical,
  onPublishWritten,
  onPublishPractical,
  onQuestions,
}: AssessmentTableProps) {
  if (isLoading) {
    return (
      <section
        className="
          rounded-3xl
          border
          border-[#e7e9ec]
          bg-white
          p-12
          text-center
        "
      >
        <p className="text-sm text-gray-400">
          Loading assessments...
        </p>
      </section>
    );
  }

  if (assessments.length === 0) {
    return (
      <section
        className="
          rounded-3xl
          border
          border-[#e7e9ec]
          bg-white
          p-12
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-gray-100
            text-xl
            font-bold
            text-gray-400
          "
        >
          {assessmentType === "written"
            ? "W"
            : "P"}
        </div>

        <h3
          className="
            mt-5
            text-base
            font-bold
            text-[#111827]
          "
        >
          No{" "}
          {assessmentType === "written"
            ? "written"
            : "practical"}{" "}
          assessments yet
        </h3>

        <p
          className="
            mx-auto
            mt-2
            max-w-md
            text-sm
            leading-6
            text-gray-500
          "
        >
          Create an assessment for this
          training batch to get started.
        </p>
      </section>
    );
  }

  if (assessmentType === "written") {
    return (
      <section
        className="
          overflow-hidden
          rounded-3xl
          border
          border-[#e7e9ec]
          bg-white
          shadow-[0_2px_12px_rgba(0,0,0,0.025)]
        "
      >
        <div className="border-b border-[#eceef1] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-gray-400
                "
              >
                Assessment Library
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  tracking-tight
                  text-[#111827]
                "
              >
                Written Assessments
              </h2>
            </div>

            <span
              className="
                rounded-full
                bg-gray-100
                px-3
                py-1.5
                text-xs
                font-semibold
                text-gray-600
              "
            >
              {assessments.length} total
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="overflow-hidden rounded-2xl border border-[#eceef1]">
            <DataTable
              columns={columns}
              data={
                assessments as AdminWrittenAssessment[]
              }
              searchable
              showPagination
              meta={{
                onQuestions,
                onEdit: onEditWritten,
                onDelete: onDeleteWritten,
                onPublish: onPublishWritten,
                deletingId,
                publishingId,
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-[#e7e9ec]
        bg-white
        shadow-[0_2px_12px_rgba(0,0,0,0.025)]
      "
    >
      <div className="border-b border-[#eceef1] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-gray-400
              "
            >
              Assessment Library
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                tracking-tight
                text-[#111827]
              "
            >
              Practical Assessments
            </h2>
          </div>

          <span
            className="
              rounded-full
              bg-gray-100
              px-3
              py-1.5
              text-xs
              font-semibold
              text-gray-600
            "
          >
            {assessments.length} total
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="overflow-hidden rounded-2xl border border-[#eceef1]">
          <DataTable
            columns={practicalColumns}
            data={
              assessments as AdminPracticalAssessment[]
            }
            searchable
            showPagination
            meta={{
              onEdit: onEditPractical,
              onDelete: onDeletePractical,
              onPublish: onPublishPractical,
              deletingId,
              publishingId,
            }}
          />
        </div>
      </div>
    </section>
  );
}