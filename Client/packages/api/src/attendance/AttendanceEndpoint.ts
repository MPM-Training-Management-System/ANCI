export const AttendanceEndpoints = {

  // TRAINER

  openSession:
    "/api/attendance/sessions/open",

  closeSession: (id: string) =>
    `/api/attendance/sessions/${id}/close`,

  getQr: (
    id: string,
    enrollmentId: string
  ) =>
    `/api/attendance/sessions/${id}/qr?enrollmentId=${enrollmentId}`,

  scan:
    "/api/attendance/scan",


  // TRAINER / PARTICIPANT / ADMIN

  getSession: (id: string) =>
    `/api/attendance/sessions/${id}`,

  getBatch: (batchId: string) =>
    `/api/attendance/batch/${batchId}`,


  // PARTICIPANT

  manual:
    "/api/attendance/manual",

} as const;