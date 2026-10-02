export type TrainerReportRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed";

export type TrainerReportType =
  | "Training Completion"
  | "Enrollment"
  | "Attendance"
  | "Assessment Results"
  | "Certificates"
  | "Trainer Report";

export interface TrainerReportRequest {
  id: string;

  reportType: TrainerReportType;
  reason?: string | null;

  trainerProfileId: string;
  trainingBatchId?: string | null;

  status: TrainerReportRequestStatus;

  adminRemarks?: string | null;
  reportFileUrl?: string | null;

  requestedAt: string;
  reviewedAt?: string | null;
}

export interface CreateTrainerReportRequest {
  reportType: TrainerReportType;
  reason?: string | null;
  trainingBatchId?: string | null;
}

export interface TrainerReportRequestListResponse {
  items: TrainerReportRequest[];
  totalCount: number;
}