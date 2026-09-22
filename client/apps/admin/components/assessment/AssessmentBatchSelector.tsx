"use client";

import type { TrainingBatch } from "@repo/types";

interface AssessmentBatchSelectorProps {
  batches: TrainingBatch[];
  selectedBatchId: string;
  selectedBatch?: TrainingBatch;
  isLoading: boolean;
  assessmentCount: number;
  onChange: (batchId: string) => void;
}

export default function AssessmentBatchSelector({
  batches,
  selectedBatchId,
  selectedBatch,
  isLoading,
  assessmentCount,
  onChange,
}: AssessmentBatchSelectorProps) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-[#e7e9ec]
        bg-white
        p-5
        shadow-[0_2px_12px_rgba(0,0,0,0.025)]
        sm:p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gray-100
              text-lg
            "
          >
            #
          </div>

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
              Current Workspace
            </p>

            <h2
              className="
                mt-1
                text-sm
                font-bold
                text-[#111827]
              "
            >
              Training Batch
            </h2>
          </div>
        </div>

        <div className="w-full lg:max-w-sm">
          <select
            value={selectedBatchId}
            disabled={isLoading}
            onChange={event =>
              onChange(event.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              border-[#dfe3e8]
              bg-[#fafafa]
              px-4
              py-3
              text-sm
              font-medium
              text-[#111827]
              outline-none
              transition
              focus:border-[#111827]
              focus:bg-white
            "
          >
            <option value="">
              Select a training batch
            </option>

            {batches.map(batch => (
              <option
                key={batch.id}
                value={batch.id}
              >
                {batch.batchCode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedBatch && (
        <div
          className="
            mt-5
            flex
            flex-wrap
            items-center
            gap-x-5
            gap-y-2
            border-t
            border-[#f0f1f3]
            pt-4
          "
        >
          <span className="text-xs text-gray-400">
            Selected batch
          </span>

          <span
            className="
              rounded-full
              bg-gray-100
              px-3
              py-1
              text-xs
              font-bold
              text-gray-700
            "
          >
            {selectedBatch.batchCode}
          </span>

          <span className="text-xs text-gray-400">
            {assessmentCount} assessment
            {assessmentCount === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </section>
  );
}