export const TrainingScheduleEndpoints = {
  // ==========================================
  // GET SCHEDULE RECOMMENDATION
  // GET /api/training-batches/{trainingBatchId}/schedule/recommendation
  // ==========================================

  recommendation: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule/recommendation`,

  // ==========================================
  // GENERATE TRAINING SCHEDULE
  // POST /api/training-batches/{trainingBatchId}/schedule/generate
  // ==========================================

  generate: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule/generate`,

  // ==========================================
  // GET TRAINING SCHEDULE
  // GET /api/training-batches/{trainingBatchId}/schedule
  // ==========================================

  getByBatchId: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule`,

  // ==========================================
  // APPROVE TRAINING SCHEDULE
  // POST /api/training-batches/{trainingBatchId}/schedule/approve
  // ==========================================

  approve: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule/approve`,
};