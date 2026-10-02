
export interface PagedReportResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}


// =========================================================
// REPORT FILTER
// Matches:
// server.DTOs.Reports.ReportFilterDto
// =========================================================

export interface ReportFilter {
  trainingProgramId?: string;
  trainingBatchId?: string;
  trainerProfileId?: string;

  dateFrom?: string;
  dateTo?: string;

  status?: string;
  search?: string;

  page?: number;
  pageSize?: number;
}


// =========================================================
// ADMIN OVERVIEW REPORT
// =========================================================

export interface AdminReportOverview {
  totalTrainingPrograms: number;
  activeTrainingPrograms: number;

  totalTrainingBatches: number;

  totalParticipants: number;

  totalEnrollments: number;
  activeEnrollments: number;

  totalTrainers: number;
  activeTrainerAssignments: number;

  totalAttendanceRecords: number;
  presentAttendance: number;
  absentAttendance: number;
  lateAttendance: number;
  attendanceRate: number;

  totalWrittenAssessments: number;
  publishedWrittenAssessments: number;
  totalAssessmentAttempts: number;

  totalCertificates: number;
  completionCertificates: number;
  participationCertificates: number;
  revokedCertificates: number;

  totalServices: number;
  activeServices: number;

  totalServiceRequests: number;
}


// =========================================================
// TRAINING COMPLETION REPORT
// =========================================================

export interface TrainingCompletionReport {
  totalParticipants: number;
  completedParticipants: number;
  incompleteParticipants: number;
  completionRate: number;

  results: PagedReportResult<TrainingCompletionReportItem>;
}

export interface TrainingCompletionReportItem {
  participantId: string;

  participantName: string;

  participantCode?: string | null;

  trainingProgramName: string;

  batchCode: string;

  trainingBatchId: string;

  trainerName?: string | null;

  trainingStartDate: string;

  trainingEndDate: string;

  attendanceRate: number;

  assessmentScore?: number | null;

  assessmentStatus: string;

  completionStatus: string;

  completedAt?: string | null;

  certificateNumber?: string | null;

  hasCertificate: boolean;
}


// =========================================================
// ENROLLMENT REPORT
// =========================================================

export interface EnrollmentReport {
  totalEnrollments: number;

  approvedEnrollments: number;

  pendingEnrollments: number;

  rejectedEnrollments: number;

  results: PagedReportResult<EnrollmentReportItem>;
}

export interface EnrollmentReportItem {
  enrollmentId: string;

  participantId: string;

  participantCode: string;

  participantName: string;

  participantEmail: string;

  trainingProgramName: string;

  trainingBatchId: string;

  batchCode: string;

  trainerName?: string | null;

  enrollmentStatus: string;

  enrolledAt: string;

  approvedAt?: string | null;

  reviewRemarks?: string | null;
}


// =========================================================
// ATTENDANCE REPORT
// =========================================================

export interface AttendanceReport {
  totalRecords: number;

  presentRecords: number;

  absentRecords: number;

  lateRecords: number;

  attendanceRate: number;

  results: PagedReportResult<AttendanceReportItem>;
}

export interface AttendanceReportItem {
  attendanceRecordId: string;

  enrollmentId: string;

  participantId: string;

  participantCode: string;

  participantName: string;

  participantEmail: string;

  trainingProgramName: string;

  trainingBatchId: string;

  batchCode: string;

  trainerName?: string | null;

  attendanceDate: string;

  timeIn?: string | null;

  timeOut?: string | null;

  attendanceStatus: string;

  attendanceMethod: string;
}


// =========================================================
// ASSESSMENT RESULTS REPORT
// =========================================================

export interface AssessmentResultsReport {
  totalAttempts: number;

  passedAttempts: number;

  failedAttempts: number;

  pendingAttempts: number;

  averageScore: number;

  passRate: number;

  results: PagedReportResult<AssessmentResultsReportItem>;
}

export interface AssessmentResultsReportItem {
  assessmentAttemptId: string;

  assessmentId: string;

  assessmentTitle: string;

  enrollmentId: string;

  participantId: string;

  participantCode: string;

  participantName: string;

  participantEmail: string;

  trainingProgramName: string;

  trainingBatchId: string;

  batchCode: string;

  trainerName?: string | null;

  attemptNumber: number;

  totalQuestions: number;

  correctAnswers: number;

  totalPoints: number;

  earnedPoints: number;

  percentage: number;

  isPassed: boolean;

  assessmentStatus: string;

  startedAt: string;

  submittedAt?: string | null;

  evaluatedAt?: string | null;
}


// =========================================================
// CERTIFICATE REPORT
// =========================================================

export interface CertificateReport {
  totalCertificates: number;

  completionCertificates: number;

  participationCertificates: number;

  activeCertificates: number;

  revokedCertificates: number;

  results: PagedReportResult<CertificateReportItem>;
}

export interface CertificateReportItem {
  certificateId: string;

  enrollmentId: string;

  participantId: string;

  participantCode: string;

  participantName: string;

  participantEmail: string;

  certificateNumber: string;

  certificateType: string;

  trainingProgramName: string;

  trainingBatchId: string;

  batchCode: string;

  trainerName?: string | null;

  issuedAt: string;

  verificationCode: string;

  pdfUrl?: string | null;

  canvaDesignId?: string | null;

  isRevoked: boolean;

  revokedAt?: string | null;

  revocationReason?: string | null;
}


// =========================================================
// TRAINER REPORT
// =========================================================

export interface TrainerReport {
  totalTrainers: number;

  activeTrainers: number;

  totalAssignments: number;

  totalParticipants: number;

  results: PagedReportResult<TrainerReportItem>;
}

export interface TrainerReportItem {
  trainerProfileId: string;

  trainerCode: string;

  trainerName: string;

  trainerEmail: string;

  assignedBatches: number;

  totalParticipants: number;

  totalAttendanceRecords: number;

  presentAttendance: number;

  absentAttendance: number;

  lateAttendance: number;

  attendanceRate: number;

  totalAssessmentAttempts: number;

  passedAssessments: number;

  failedAssessments: number;

  assessmentPassRate: number;

  totalCertificates: number;

  completionCertificates: number;

  participationCertificates: number;

  lastAssignedAt?: string | null;

  isActive: boolean;
}


// =========================================================
// SERVICE REQUEST REPORT
// =========================================================

export interface ServiceRequestReport {
  totalRequests: number;

  pendingRequests: number;

  approvedRequests: number;

  rejectedRequests: number;

  reviewedRequests: number;

  results: PagedReportResult<ServiceRequestReportItem>;
}

export interface ServiceRequestReportItem {
  serviceRequestId: string;

  serviceId: string;

  serviceCode: string;

  serviceName: string;

  serviceCategory: string;

  requiresTraining: boolean;

  userId?: string | null;

  applicantName: string;

  applicantEmail: string;

  remarks?: string | null;

  requestStatus: string;

  requestedAt: string;

  reviewedAt?: string | null;

  reviewedByUserId?: string | null;

  reviewerName?: string | null;

  resolutionType?: string | null;

  adminRemarks?: string | null;
}


// =========================================================
// REPORT TYPE UNION
// Useful when switching between report sections/tabs.
// =========================================================

export type ReportType =
  | "overview"
  | "training-completion"
  | "enrollments"
  | "attendance"
  | "assessment-results"
  | "certificates"
  | "trainers"
  | "service-requests";


// =========================================================
// COMMON REPORT STATUS VALUES
// =========================================================

export type ReportAttendanceStatus =
  | "Present"
  | "Absent"
  | "Late";

export type ReportAssessmentStatus =
  | "Passed"
  | "Failed"
  | "Pending"
  | "Not Taken";

export type ReportCompletionStatus =
  | "Completed"
  | "Incomplete";

export type ReportCertificateType =
  | "Completion"
  | "Participation";

export type ReportEnrollmentStatus =
  | "Approved"
  | "Pending"
  | "Rejected";

export type ReportServiceRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected";


// =========================================================
// REPORT SUMMARY CARD
// Useful for reusable StatCard components.
// =========================================================

export interface ReportSummaryCard {
  label: string;

  value: number | string;

  description?: string;

  trend?: number;

  trendLabel?: string;

  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning";
}


// =========================================================
// CHART DATA
// Useful for Recharts.
// =========================================================

export interface ReportChartDataItem {
  name: string;

  value: number;

  [key: string]: string | number;
}


// =========================================================
// ATTENDANCE CHART DATA
// =========================================================

export interface AttendanceChartData {
  present: number;

  absent: number;

  late: number;
}


// =========================================================
// ASSESSMENT CHART DATA
// =========================================================

export interface AssessmentChartData {
  passed: number;

  failed: number;

  pending: number;
}


// =========================================================
// CERTIFICATE CHART DATA
// =========================================================

export interface CertificateChartData {
  completion: number;

  participation: number;

  revoked: number;
}


// =========================================================
// ENROLLMENT CHART DATA
// =========================================================

export interface EnrollmentChartData {
  approved: number;

  pending: number;

  rejected: number;
}


// =========================================================
// SERVICE REQUEST CHART DATA
// =========================================================

export interface ServiceRequestChartData {
  pending: number;

  approved: number;

  rejected: number;
}