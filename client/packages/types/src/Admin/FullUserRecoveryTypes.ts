export interface FullUserRecoveryPreview {
  userId: string;
  userCode: string;
  fullName: string;
  email: string;

  userExistsInRecovery: boolean;
  userExistsInProduction: boolean;

  relatedRecordsFound: number;
  recordsAlreadyInProduction: number;
  recordsMissingFromProduction: number;

  entities: FullRecoveryEntitySummary[];
  warnings: string[];
}

export interface FullRecoveryEntitySummary {
  entityName: string;
  sourceCount: number;
  existingCount: number;
  missingCount: number;
}

export interface FullUserRecoveryResult {
  userId: string;
  success: boolean;
  restoredRecords: number;
  skippedRecords: number;
  failedRecords: number;
  messages: string[];
}

export interface FullUserRecoveryApiError {
  message: string;
}