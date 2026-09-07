export type ReportStatus =
  | "Active"
  | "Completed"
  | "Pending"
  | "Approved"
  | "Failed"
  | "Absent"
  | "Passed";

export type ReportType =
  | "Enrollment"
  | "Training"
  | "Attendance"
  | "Assessment"
  | "Trainer";

export type ReportRecord = {
  id: string;

  participantId: string;
  participantName: string;
  email: string;

  training: string;
  batch: string;
  trainer: string;

  enrollmentDate: string;

  attendance: number;
  sessions: number;

  score: number | null;

  status: ReportStatus;
};