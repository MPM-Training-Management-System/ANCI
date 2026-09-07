"use client";

import { useState } from "react";
import type {
  TrainingBatch,
  TrainingScheduleRecommendation,
  GenerateTrainingScheduleRequest,
  TrainingSession,
} from "@repo/types";
import TrainingScheduleManager from "./TrainingScheduleManager";

type TrainingScheduleActionProps = {
  batch: TrainingBatch;

  scheduleRecommendation: TrainingScheduleRecommendation | null;
  trainingSessions: TrainingSession[];
  isLoadingSchedule: boolean;
  isGeneratingSchedule: boolean;
  scheduleError: string | null;

  getScheduleRecommendation: (
    trainingBatchId: string,
  ) => Promise<TrainingScheduleRecommendation | null>;

  generateSchedule: (
    trainingBatchId: string,
    request: GenerateTrainingScheduleRequest,
  ) => Promise<TrainingSession[] | null>;

  getSchedule: (
    trainingBatchId: string,
  ) => Promise<TrainingSession[] | null>;

 approveSchedule: (
  trainingBatchId: string,
  sessions: TrainingSession[],
) => Promise<boolean>;
};

export default function TrainingScheduleAction({
  batch,
  scheduleRecommendation,
  trainingSessions,
  isLoadingSchedule,
  isGeneratingSchedule,
  scheduleError,
  getScheduleRecommendation,
  generateSchedule,
  getSchedule,
  approveSchedule,
}: TrainingScheduleActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100"
      >
        Schedule
      </button>

      {isOpen && (
        <TrainingScheduleManager
          batch={batch}
          onClose={() => setIsOpen(false)}
          scheduleRecommendation={scheduleRecommendation}
          trainingSessions={trainingSessions}
          isLoadingSchedule={isLoadingSchedule}
          isGeneratingSchedule={isGeneratingSchedule}
          scheduleError={scheduleError}
          getScheduleRecommendation={getScheduleRecommendation}
          generateSchedule={generateSchedule}
          getSchedule={getSchedule}
          approveSchedule={approveSchedule}
        />
      )}
    </>
  );
}
