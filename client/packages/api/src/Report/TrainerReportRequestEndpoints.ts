export const TrainerReportRequestEndpoints = {
  myRequests: "/api/trainer/report-requests",

  create: "/api/trainer/report-requests",

  adminRequests: "/api/admin/trainer-report-requests",

  approve: (id: string) =>
    `/api/admin/trainer-report-requests/${id}/approve`,

  reject: (id: string) =>
    `/api/admin/trainer-report-requests/${id}/reject`,
} as const;