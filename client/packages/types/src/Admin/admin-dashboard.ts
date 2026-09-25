export interface AdminDashboard {
  users: UserStats;
  training: TrainingStats;
  enrollments: EnrollmentStats;
  trainerApplications: TrainerApplicationStats;
  serviceRequests: ServiceRequestStats;
  certificates: CertificateStats;
  assessments: AssessmentStats;
  attendance: AttendanceStats;

  monthlyActivity: MonthlyActivity[];

  recentEnrollments: RecentEnrollment[];
  upcomingBatches: UpcomingBatch[];
}

export interface UserStats {
  totalUsers: number;
  totalParticipants: number;
  totalTrainers: number;
  totalAdmins: number;
  unverifiedEmailCount: number;
}

export interface TrainingStats {
  activeTrainingPrograms: number;
  totalTrainingPrograms: number;
  totalBatches: number;
  ongoingBatches: number;
  upcomingBatchesCount: number;
  completedBatches: number;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  pendingEnrollments: number;
  approvedEnrollments: number;
  rejectedEnrollments: number;
  completedEnrollments: number;
}

export interface TrainerApplicationStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

export interface ServiceRequestStats {
  totalRequests: number;
  pendingRequests: number;
  resolvedRequests: number;
}

export interface CertificateStats {
  totalIssued: number;
  issuedThisMonth: number;
  revokedCount: number;
}

export interface AssessmentStats {
  totalAttemptsEvaluated: number;
  passedCount: number;
  failedCount: number;
  passRatePercentage: number;
}

export interface AttendanceStats {
  totalRecordsToday: number;
  presentToday: number;
  absentToday: number;
}

export interface MonthlyActivity {
  month: string;
  enrollments: number;
  completedTrainings: number;
}

export interface RecentEnrollment {
  enrollmentId: string;
  participantName: string;
  batchCode: string;
  status: string;
  enrolledAt: string;
}

export interface UpcomingBatch {
  trainingBatchId: string;
  batchCode: string;
  programName: string;
  startDate: string;
  capacity: number;
  enrolledCount: number;
}