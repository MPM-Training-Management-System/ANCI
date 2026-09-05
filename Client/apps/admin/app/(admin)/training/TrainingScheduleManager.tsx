import type {
  TrainingBatch,
  TrainingScheduleRecommendation,
  GenerateTrainingScheduleRequest,
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
}

/**
 * Small connector between the existing useTrainingBatches hook
 * and TrainingScheduleModal.
 *
 * Put this beside TrainingScheduleModal.tsx.
 */
export default function TrainingScheduleManager({
  batch,
  onClose,
  scheduleRecommendation,
  trainingSessions,
  isLoadingSchedule,
  isGeneratingSchedule,
  scheduleError,
  getScheduleRecommendation,
  generateSchedule,
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
      error={scheduleError}
      onLoadRecommendation={getScheduleRecommendation}
      onGenerate={generateSchedule}
      onGetSchedule={getSchedule}
      onApprove={approveSchedule}
      onClose={onClose}
    />
  );
}
