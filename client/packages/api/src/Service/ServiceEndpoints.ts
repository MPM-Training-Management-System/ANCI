export const ServiceEndpoints = {
  // =========================
  // SERVICES
  // =========================

  getAll: () => `/api/services`,

  getById: (id: string) =>
    `/api/services/${id}`,

  create: () =>
    `/api/services`,

  update: (id: string) =>
    `/api/services/${id}`,

  delete: (id: string) =>
    `/api/services/${id}`,

  // =========================
  // SERVICE REQUESTS
  // =========================

  createRequest: () =>
    `/api/services/requests`,

  getRequests: () =>
    `/api/services/requests`,

  getRequestById: (id: string) =>
    `/api/services/requests/${id}`,

  updateRequestStatus: (id: string) =>
    `/api/services/requests/${id}/status`,
};