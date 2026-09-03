export type AttendanceSessionStatus =
  | "Closed"
  | "Open";

export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "TimeInOnly"
  | "TimeOutOnly";


export type OpenAttendanceRequest = {
  trainingBatchId: string;
};


export type AttendanceQrDto = {
  attendanceSessionId: string;
  enrollmentId: string;
  token: string;
  expiresAt: string;
};


export type ScanAttendanceRequest = {
  attendanceSessionId: string;
  token: string;
};


export type ManualAttendanceRequest = {
  attendanceSessionId: string;
  action: string;
};


export type AttendanceRecordDto = {
  id: string;
  participantName: string;
  timeIn: string | null;
  timeOut: string | null;
  status: string;
  method: string;
};