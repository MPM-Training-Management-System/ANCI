export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Excused";

export type AttendanceSessionStatus =
  | "Draft"
  | "Open"
  | "Closed"
  | "Submitted";

export type AttendanceMethod =
  | "Manual"
  | "QR"
  | "Participant";

export type TrainingOption = {
  name: string;
  code: string;
};

export type Participant = {
  id: string;
  participantId: string;
  name: string;
  email: string;
  training: string;
};

export type AttendanceRecord = {
  status: AttendanceStatus;
  timeIn: string;
  timeOut: string;
  timeInMethod: AttendanceMethod | null;
  timeOutMethod: AttendanceMethod | null;
  remarks: string;
};

export type HistoryRecord = {
  id: string;
  participantId: string;
  name: string;
  training: string;
  session: string;
  date: string;
  status: AttendanceStatus;
  timeIn: string;
  timeOut: string;
  remarks: string;
};