export type AttendanceSessionStatus =
  | "Closed"
  | "Open";

export type ManualAttendanceStatus =
  | "Closed"
  | "Open";

export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "TimeInOnly"
  | "TimeOutOnly";

// ============================================================
// OPEN SESSION REQUEST
// ============================================================

export type OpenAttendanceRequest = {
  trainingBatchId: string;
  trainingSessionId: string

};

// ============================================================
// ATTENDANCE QR
//
// Permanent participant QR.
// expiresAt is kept for API compatibility.
// Backend returns DateTime.MaxValue.
// ============================================================

export type AttendanceQrDto = {
  attendanceSessionId: string;
  enrollmentId: string;
  token: string;
  expiresAt: string;
};

// ============================================================
// SCAN ATTENDANCE
// Trainer scans participant QR.
// ============================================================

export type ScanAttendanceRequest = {
  attendanceSessionId: string;
  token: string;
};

// ============================================================
// MANUAL ATTENDANCE
// Participant Time In / Time Out.
// ============================================================

export type ManualAttendanceRequest = {
  attendanceSessionId: string;
  action: string;
};

// ============================================================
// ATTENDANCE RECORD
// ============================================================

export type AttendanceRecordDto = {
  id: string;
  participantName: string;
  timeIn: string | null;
  timeOut: string | null;
  status: string;
  method: string;
};

// ============================================================
// CURRENT OPEN ATTENDANCE SESSION
//
// Used by Trainer / Participant / Admin.
//
// isOpen:
//   true  = training session is running
//   false = no active training session
//
// attendanceSessionId:
//   active session ID when isOpen = true
//
// manualAttendanceOpen:
//   true  = participant manual Time In/Out enabled
//   false = participant manual Time In/Out disabled
// ============================================================

export type OpenAttendanceSessionDto = {
  isOpen: boolean;
  attendanceSessionId: string | null;
  manualAttendanceOpen: boolean;
};


export type AttendanceProgressDto = {
  enrollmentId: string;
  trainingBatchId: string;
  participantName: string;
  totalSessions: number;
  attendedSessions: number;
  lateSessions: number;
  absentSessions: number;
  attendancePercentage: number;
};