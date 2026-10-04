export const TrainerReportRequestEndpoints = {
  // =========================================================
  // TRAINER
  // =========================================================

  myRequests: "/api/trainer/report-requests",

  create: "/api/trainer/report-requests",

  // =========================================================
  // ADMIN
  // =========================================================

  adminRequests:
    "/api/admin/trainer-report-requests",

  approve: (id: string) =>
    `/api/admin/trainer-report-requests/${id}/approve`,

  reject: (id: string) =>
    `/api/admin/trainer-report-requests/${id}/reject`,
} as const;