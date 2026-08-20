import type { TableMeta } from "@tanstack/react-table";

export type AssessmentResult =
  | "Passed"
  | "Failed"
  | "Pending";

export type CompletionStatus =
  | "Completed"
  | "In Progress"
  | "For Review"
  | "Incomplete";

export type CertificateStatus =
  | "Not Eligible"
  | "Pending Review"
  | "Eligible"
  | "Generated"
  | "Issued";

export type CertificationRecord = {
  id: string;

  participantId: string;
  participantName: string;

  training: string;
  batch: string;
  trainer: string;

  assessmentScore: number | null;
  assessmentResult: AssessmentResult;

  attendance: number;
  requiredAttendance: number;

  totalSessions: number;
  completedSessions: number;

  completionStatus: CompletionStatus;
  completionDate: string | null;

  certificateNo: string | null;
  verificationCode: string | null;

  certificateStatus: CertificateStatus;

  generatedAt: string | null;
  issuedAt: string | null;

  remarks: string;
};

export type CertificationTableMeta =
  TableMeta<CertificationRecord> & {
    onView?: (
      record: CertificationRecord
    ) => void;

    onGenerate?: (
      record: CertificationRecord
    ) => void;

    onCertificate?: (
      record: CertificationRecord
    ) => void;
};