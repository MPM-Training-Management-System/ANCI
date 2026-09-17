export const ServiceEndpoints = {
  // Services
  getAll: () => `/api/services`,
  getById: (id: string) => `/api/services/${id}`,
  create: () => `/api/services`,
  update: (id: string) => `/api/services/${id}`,
  delete: (id: string) => `/api/services/${id}`,

  // Service Requests
  createRequest: () => `/api/services/requests`,
  getRequests: () => `/api/services/requests`,
  getRequestById: (id: string) => `/api/services/requests/${id}`,
reviewRequest: (id: string) =>
  `/api/services/requests/${id}/review`,

getConsultations: () =>
  `/api/services/consultations`,

getConsultationById: (id: string) =>
  `/api/services/consultations/${id}`,

createConsultation: () =>
  `/api/services/consultations`,

updateConsultation: (id: string) =>
  `/api/services/consultations/${id}`,
};