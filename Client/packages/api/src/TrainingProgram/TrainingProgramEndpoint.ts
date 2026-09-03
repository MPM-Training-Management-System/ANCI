export const TrainingProgramEndpoint = {

  get:
    "/api/training-programs",

  create:
    "/api/training-programs",

  byId: (
    id: string
  ) =>
    `/api/training-programs/${id}`,

  update: (
    id: string
  ) =>
    `/api/training-programs/${id}`,

  delete: (
    id: string
  ) =>
    `/api/training-programs/${id}`,
};