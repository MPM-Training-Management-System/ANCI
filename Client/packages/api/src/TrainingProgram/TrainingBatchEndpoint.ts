export const TrainingBatchEndpoints = {
  getAll: "/api/training-batches",

  byId: (id: string) =>
    `/api/training-batches/${id}`,

  create: "/api/training-batches",

  assigned: "/api/training-batches/assigned",

  update: (id: string) =>
    `/api/training-batches/${id}`,

  status: (id: string) =>
    `/api/training-batches/${id}/status`,

  delete: (id: string) =>
    `/api/training-batches/${id}`,

    getParticipantSchedule: (trainingBatchId: string) =>
    `/api/training-batches/${trainingBatchId}/schedule/participant`,

};