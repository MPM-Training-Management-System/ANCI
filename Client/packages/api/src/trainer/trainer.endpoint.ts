export const TrainerEndpoints = {
  create:
    "/api/trainer/complete-profile",

  list:
    "/api/trainer",

  byId: (id: string) =>
    `/api/trainer/${id}`,

  update: (id: string) =>
    `/api/trainer/${id}`,

  delete: (id: string) =>
    `/api/trainer/${id}`,

  status: (
    id: string,
    isActive: boolean
  ) =>
    `/api/trainer/${id}/status`,

  verify: (
    id: string,
    isApproved: boolean
  ) =>
    `/api/trainer/${id}/verify`,
};