export const TrainingProgramDocumentEndpoint = {
  getAll: (trainingProgramId: string) =>
    `/api/training-programs/${trainingProgramId}/documents`,

  upload: (trainingProgramId: string) =>
    `/api/training-programs/${trainingProgramId}/documents`,

  delete: (
    trainingProgramId: string,
    documentId: string
  ) =>
    `/api/training-programs/${trainingProgramId}/documents/${documentId}`,
};