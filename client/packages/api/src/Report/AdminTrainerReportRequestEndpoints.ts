export const AdminTrainerReportRequestEndpoints = {
  list:
    "/api/admin/trainer-report-requests",

  approveAndGenerate:
    (id: string) =>
      `/api/admin/trainer-report-requests/${id}/approve-and-generate`,

  reject:
    (id: string) =>
      `/api/admin/trainer-report-requests/${id}/reject`,
} as const;