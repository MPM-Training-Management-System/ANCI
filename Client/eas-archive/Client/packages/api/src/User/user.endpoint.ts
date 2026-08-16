export const UserApplicationEndpoints = {
  // =====================================================
  // GET ALL PENDING APPLICATIONS
  // =====================================================

  pending:
    "/api/admin/applications/pending",

  // =====================================================
  // GET APPLICATION DETAILS
  // =====================================================

  byId: (id: string) =>
    `/api/admin/applications/${id}`,

  // =====================================================
  // APPROVE APPLICATION
  // =====================================================

  approve: (id: string) =>
    `/api/admin/applications/${id}/approve`,

  // =====================================================
  // REJECT APPLICATION
  // =====================================================

  reject: (id: string) =>
    `/api/admin/applications/${id}/reject`,
};