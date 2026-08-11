export const ParticipantApplicationEndpoints = {
  pending:
    "/api/admin/participant-applications/pending",

  byId: (id: string) =>
    `/api/admin/participant-applications/${id}`,

  approve: (id: string) =>
    `/api/admin/participant-applications/${id}/approve`,

  reject: (id: string) =>
    `/api/admin/participant-applications/${id}/reject`,
};