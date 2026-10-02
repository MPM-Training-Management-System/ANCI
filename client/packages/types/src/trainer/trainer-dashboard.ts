// ============================================================
// TRAINER DASHBOARD TYPES
// ============================================================

export interface TrainerDashboardTraining {
  trainingBatchId: string;
  trainingName: string;
  batchName: string;
  status: string;
  startDate: string;
  endDate: string;
  participantCount: number;
}

export interface TrainerDashboardStats {
  totalParticipants: number;
  totalSessions: number;
  completedSessions: number;
  sessionProgress: number;
  attendanceRate: number;
}

export interface TrainerDashboardSession {
  trainingSessionId: string;
  title: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: string;
  attendanceOpen: boolean;
}

export interface TrainerDashboardAttendance {
  present: number;
  late: number;
  absent: number;
  totalRecorded: number;
  attendanceRate: number;
}

export interface TrainerDashboardUpcomingSession {
  trainingSessionId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  title: string;
}

export interface TrainerDashboard {
  training: TrainerDashboardTraining | null;
  stats: TrainerDashboardStats;
  todaySession: TrainerDashboardSession | null;
  attendance: TrainerDashboardAttendance;
  upcomingSessions: TrainerDashboardUpcomingSession[];
}