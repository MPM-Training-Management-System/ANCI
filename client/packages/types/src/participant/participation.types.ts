// ==========================================================
// PARTICIPATION SETTING
// ==========================================================

export interface ParticipationSetting {
  id: string;
  trainingBatchId: string;
  requiredRecitations: number;
  createdAt: string;
  updatedAt?: string | null;
}

// ==========================================================
// PARTICIPATION RECORD
// ==========================================================

export interface ParticipationRecord {
  id: string;
  enrollmentId: string;
  trainingSessionId: string;
  recordedByUserId: string;
  recordedAt: string;
  remarks?: string | null;
}

// ==========================================================
// PARTICIPANT PARTICIPATION
// ==========================================================

export interface ParticipationParticipant {
  enrollmentId: string;
  participantProfileId: string;
  participantName: string;

  hasRecited: boolean;

  actualRecitations: number;
  requiredRecitations: number;

  participationPercentage: number;

  participationRecordId?: string | null;
}

// ==========================================================
// PARTICIPATION PROGRESS
// ==========================================================

export interface ParticipationProgress {
  enrollmentId: string;

  actualRecitations: number;
  requiredRecitations: number;

  participationPercentage: number;
}

// ==========================================================
// REQUESTS
// ==========================================================

export interface SaveParticipationSettingRequest {
  requiredRecitations: number;
}

export interface RecordParticipationRequest {
  enrollmentId: string;
  trainingSessionId: string;
  remarks?: string;
}