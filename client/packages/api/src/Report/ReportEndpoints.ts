export const ReportEndpoints = {
  // =========================================================
  // ADMIN REPORTS
  // =========================================================

  // ADMIN OVERVIEW
  overview:
    "/api/reports/admin/overview",

  // TRAINING COMPLETION
  trainingCompletion:
    "/api/reports/admin/training-completion",

  // ENROLLMENTS
  enrollments:
    "/api/reports/admin/enrollments",

  // ATTENDANCE
  attendance:
    "/api/reports/admin/attendance",

  // ASSESSMENT RESULTS
  assessmentResults:
    "/api/reports/admin/assessment-results",

  // CERTIFICATES
  certificates:
    "/api/reports/admin/certificates",

  // TRAINERS
  trainers:
    "/api/reports/admin/trainers",

  // SERVICE REQUESTS
  serviceRequests:
    "/api/reports/admin/service-requests",
} as const;