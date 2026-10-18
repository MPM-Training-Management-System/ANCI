
import type {
  TrainingBatch,
  TrainingScheduleRecommendation,
  GenerateTrainingScheduleRequest,
  CreateManualTrainingScheduleRequest,
  TrainingSession,
} from "@repo/types";

import TrainingScheduleModal from "./TrainingScheduleModal";

type TrainingScheduleManagerProps = {
  batch: TrainingBatch | null;
  onClose: () => void;

  scheduleRecommendation: TrainingScheduleRecommendation | null;
  trainingSessions: TrainingSession[];

  isLoadingSchedule: boolean;
  isGeneratingSchedule: boolean;
  isCreatingManualSchedule: boolean;

  scheduleError: string | null;

  getScheduleRecommendation: (
    trainingBatchId: string,
  ) => Promise<TrainingScheduleRecommendation | null>;

  generateSchedule: (
    trainingBatchId: string,
    request: GenerateTrainingScheduleRequest,
  ) => Promise<TrainingSession[] | null>;

  createManualSchedule: (
    trainingBatchId: string,
    request: CreateManualTrainingScheduleRequest,
  ) => Promise<TrainingSession[] | null>;

  getSchedule: (
    trainingBatchId: string,
  ) => Promise<TrainingSession[] | null>;

  approveSchedule: (
    trainingBatchId: string,
    sessions: TrainingSession[],
  ) => Promise<boolean>;
};

/**
 * Connects useTrainingBatches to TrainingScheduleModal.
 * Supports automatic generation, manual schedule creation,
 * loading saved sessions, and schedule approval.
 */
export default function TrainingScheduleManager({
  batch,
  onClose,
  scheduleRecommendation,
  trainingSessions,
  isLoadingSchedule,
  isGeneratingSchedule,
  isCreatingManualSchedule,
  scheduleError,
  getScheduleRecommendation,
  generateSchedule,
  createManualSchedule,
  getSchedule,
  approveSchedule,
}: TrainingScheduleManagerProps) {
  if (!batch) return null;

  return (
    <TrainingScheduleModal
      batch={batch}
      recommendation={scheduleRecommendation}
      sessions={trainingSessions}
      isLoading={isLoadingSchedule}
      isGenerating={isGeneratingSchedule}
      isCreatingManualSchedule={isCreatingManualSchedule}
      error={scheduleError}
      onLoadRecommendation={getScheduleRecommendation}
      onGenerate={generateSchedule}
      onCreateManual={createManualSchedule}
      onGetSchedule={getSchedule}
      onApprove={approveSchedule}
      onClose={onClose}
    />
  );
}
