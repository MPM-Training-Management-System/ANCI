export const AttendanceEndpoints = {

  // =========================================================
  // TRAINER
  // =========================================================

  // START SESSION
  openSession:
    "/api/attendance/sessions/open",

  // END SESSION
  closeSession: (id: string) =>
    `/api/attendance/sessions/${id}/close`,

  // =========================================================
  // TRAINER - MANUAL ATTENDANCE CONTROL
  // =========================================================

  // OPEN MANUAL ATTENDANCE
  openManualAttendance: (id: string) =>
    `/api/attendance/sessions/${id}/manual/open`,

  // CLOSE MANUAL ATTENDANCE
  closeManualAttendance: (id: string) =>
    `/api/attendance/sessions/${id}/manual/close`,

  // =========================================================
  // TRAINER / PARTICIPANT
  // =========================================================

  // PERMANENT PARTICIPANT QR
  getQr: (
    id: string,
    enrollmentId: string
  ) =>
    `/api/attendance/sessions/${id}/qr?enrollmentId=${enrollmentId}`,

  // TRAINER SCANS PARTICIPANT QR
  scan:
    "/api/attendance/scan",

  // =========================================================
  // TRAINER / PARTICIPANT / ADMIN
  // =========================================================

  // GET SPECIFIC SESSION ATTENDANCE
  getSession: (id: string) =>
    `/api/attendance/sessions/${id}`,

  // GET ALL ATTENDANCE FOR BATCH
  getBatch: (batchId: string) =>
    `/api/attendance/batch/${batchId}`,


  getattendanceprogress: 
  "/api/attendance/trainer/progress",

  // GET CURRENT SESSION STATE
  //
  // Returns:
  // {
  //   isOpen: boolean,
  //   attendanceSessionId: string | null,
  //   manualAttendanceOpen: boolean
  // }
  //
   getOpenSession: (
    trainingBatchId: string,
    trainingSessionId: string,
  ) =>
    `/api/attendance/batch/${trainingBatchId}/open?trainingSessionId=${trainingSessionId}`,

  
  // MANUAL TIME IN / TIME OUT
  manual:
    "/api/attendance/manual",

} as const;