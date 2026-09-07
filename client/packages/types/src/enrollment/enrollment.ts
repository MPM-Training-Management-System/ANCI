export type EnrollmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "UnderReview"
  | "NeedsCorrection"
  | "Cancelled";

export interface EnrollmentParticipant {
  id: string;
  userId: string;
  userCode: string;
  fullName: string;
  email: string;
  mobileNumber: string | null;
  profileImageUrl: string | null;
}

export interface CreateEnrollmentRequest {
  trainingBatchId: string;
}

export interface ReviewEnrollmentRequest {
  decision: string;
  remarks?: string | null;
}

export interface EnrollmentDocument {
  id: string;
  requirementId: string;
  requirementName: string;
  fileName: string;
  fileUrl: string;
  status: EnrollmentDocumentStatus;
  reviewRemarks: string | null;
}

export type EnrollmentDocumentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "NeedsCorrection";

  export type EnrollmentDocumentDecision =
  | "Approved"
  | "Rejected"
  | "NeedsCorrection";

export interface ReviewEnrollmentDocumentRequest {
  decision: EnrollmentDocumentDecision;
  remarks?: string | null;
}


export interface EnrollmentTrainer {
  trainerProfileId: string;
  userId: string;
  fullName: string;
  userCode: string;
  email: string;
  profileImageUrl: string | null;
}

export interface Enrollment {
  id: string;
  participantProfileId: string;
  participant: EnrollmentParticipant;
  trainingBatchId: string;
  programName: string;
  batchCode: string;
 attendanceToken?: string | null;
  status: EnrollmentStatus;

  enrolledAt: string;

  approvedAt: string | null;

  reviewRemarks: string | null;

   trainer: EnrollmentTrainer | null;

  documents: EnrollmentDocument[];
}