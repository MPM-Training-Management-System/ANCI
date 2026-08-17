export const ParticipantApplicationEndpoints = {
  pending:
    "/api/admin/applications/pending",

  byId: (id: string) =>
    `/api/admin/applications/${id}`,

  approve: (id: string) =>
    `/api/admin/applications/${id}/approve`,

  reject: (id: string) =>
    `/api/admin/applications/${id}/reject`,
};