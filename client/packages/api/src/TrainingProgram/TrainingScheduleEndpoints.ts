
export const TrainingScheduleEndpoints = {
  // GET /api/training-batches/{id}/schedule/recommendation
  recommendation: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule/recommendation`,

  // POST /api/training-batches/{id}/schedule/generate
  generate: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule/generate`,

  // POST /api/training-batches/{id}/schedule/manual/preview
  // IMPORTANT: This currently SAVES the manual sessions.
  createManual: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule/manual/preview`,

  // GET /api/training-batches/{id}/schedule
  getByBatchId: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule`,

  // GET /api/training-batches/{id}/schedule/participant
  getParticipantSchedule: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule/participant`,

  // POST /api/training-batches/{id}/schedule/approve
  approve: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule/approve`,
};
