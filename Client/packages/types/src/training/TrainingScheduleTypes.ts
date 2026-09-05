// ============================================================
// TRAINING SCHEDULE TYPES
// ============================================================

// ============================================================
// TRAINING SCHEDULE RECOMMENDATION
// Matches:
// GET /api/training-batches/{trainingBatchId}/schedule/recommendation
// ============================================================

export interface TrainingScheduleRecommendation {
  trainingBatchId: string;

  requiredHours: number;

  startDate: string;

  endDate: string;

  availableWeeks: number;

  recommendedSessionsPerWeek: number;

  recommendedHoursPerSession: number;

  estimatedWeeklyHours: number;

  estimatedSessionCount: number;

  includeWeekends: boolean;
}

// ============================================================
// GENERATE TRAINING SCHEDULE REQUEST
// Matches:
// POST /api/training-batches/{trainingBatchId}/schedule/generate
// ============================================================

export interface GenerateTrainingScheduleRequest {
  sessionsPerWeek: number;

  startTime: string;

  endTime: string;

  includeWeekends: boolean;
}

// ============================================================
// GENERATED / SAVED TRAINING SESSION
// Matches:
// GET /api/training-batches/{trainingBatchId}/schedule
// POST /api/training-batches/{trainingBatchId}/schedule/generate
// ============================================================

export interface TrainingSession {
  id: string;

  trainingBatchId: string;

  sessionNumber: number;

  sessionDate: string;

  startTime: string;

  endTime: string;

  durationHours: number;

  status: TrainingSessionStatus;
}

// ============================================================
// TRAINING SESSION STATUS
// ============================================================

export type TrainingSessionStatus =
  | "Scheduled"
  | "InProgress"
  | "Completed"
  | "Cancelled";

// ============================================================
// TRAINING SCHEDULE STATUS
// ============================================================

export type TrainingScheduleStatus =
  | "Draft"
  | "Recommended"
  | "Approved"
  | "Rejected";
