export type TrainerReportRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed";

export type TrainerReportType =
  | "Attendance"
  | "Assessment"
  | "TrainingSummary"
  | "Enrollment"
  | "Certificate";


// =========================================================
// TRAINER
// =========================================================

export interface CreateTrainerReportRequest {
  reportType: TrainerReportType;
  trainingBatchId: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  reason?: string | null;
}

export interface TrainerReportRequest {
  id: string;

  trainingBatchId: string;

  batchCode: string;

  trainingProgramName: string;

  reportType: TrainerReportType;

  dateFrom?: string | null;

  dateTo?: string | null;

  reason?: string | null;

  status: TrainerReportRequestStatus;

  requestedAt: string;

  reviewedAt?: string | null;

  adminRemarks?: string | null;

  reportFileUrl?: string | null;
}


// =========================================================
// ADMIN
// =========================================================

export interface AdminTrainerReportRequest {
  id: string;

  trainerProfileId: string;

  trainingBatchId: string;

  trainerName: string;

  trainerCode: string;

  batchCode: string;

  trainingProgramName: string;

  reportType: TrainerReportType;

  dateFrom?: string | null;

  dateTo?: string | null;

  reason?: string | null;

  status: TrainerReportRequestStatus;

  requestedAt: string;

  reviewedAt?: string | null;

  reviewedByUserId?: string | null;

  adminRemarks?: string | null;

  reportFileUrl?: string | null;
}


// =========================================================
// ADMIN REVIEW
// =========================================================

export interface ReviewTrainerReportRequest {
  adminRemarks?: string | null;
}