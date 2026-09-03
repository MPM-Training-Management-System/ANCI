// ==========================================
// TRAINING STATUS
// ==========================================

export type TrainingStatus =
  | "Draft"
  | "Published"
  | "Ongoing"
  | "Completed"
  | "Cancelled";


// ==========================================
// TRAINING PROGRAM REQUIREMENT
// ==========================================

export interface TrainingProgramRequirement {
  id: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  displayOrder: number;
}


// ==========================================
// TRAINING PROGRAM REQUIREMENT REQUEST
// ==========================================

export interface TrainingProgramRequirementRequest {
  name: string;
  description?: string | null;
  isRequired: boolean;
  displayOrder: number;
}


// ==========================================
// CREATE TRAINING PROGRAM
// ==========================================

export interface CreateTrainingProgramRequest {
  programCode: string;
  name: string;
  description: string;
  durationHours: number;
  requirements: TrainingProgramRequirementRequest[];
}


// ==========================================
// UPDATE TRAINING PROGRAM
// ==========================================

export interface UpdateTrainingProgramRequest {
  programCode: string;
  name: string;
  description?: string | null;
  durationHours: number;
  requirements: TrainingProgramRequirementRequest[];
}


// ==========================================
// TRAINING PROGRAM
// ==========================================

export interface TrainingProgram {
  id: string;
  programCode: string;
  name: string;
  description: string | null;
  durationHours: number;
  isActive: boolean;
  createdAt: string;
  requirements: TrainingProgramRequirement[];
}


// ==========================================
// TRAINING BATCH
// ==========================================

export interface CreateTrainingBatchRequest {
  trainingProgramId: string;
  batchCode: string;
  location?: string | null;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  capacity: number;
}


export interface UpdateTrainingBatchRequest {
  trainingProgramId: string;
  batchCode: string;
  location?: string | null;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  capacity: number;
}
export interface TrainingBatchTrainer {
  trainerProfileId: string;
  userId: string;
  fullName: string;
  userCode: string;
  email: string;
  profileImageUrl: string | null;
}

export interface TrainingBatch {
  id: string;
  programName: string;
  batchCode: string;
  location: string | null;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolledCount: number;
  status: string;
  trainer: TrainingBatchTrainer | null;
}


// ==========================================
// UPDATE BATCH STATUS
// ==========================================

export type UpdateTrainingBatchStatusRequest =
  TrainingStatus;


// ==========================================
// TRAINER ASSIGNMENT
// ==========================================

export interface AssignTrainerRequest {
  trainerProfileId: string;
  trainingBatchId: string;
}


export interface TrainerAssignment {
  id: string;
  trainerProfileId: string;
  trainingBatchId: string;
  trainerName: string;
  batchCode: string;
  assignedAt: string;
  isActive: boolean;
}


// ==========================================
// TRAINING PROGRAM DOCUMENT
// ==========================================

export interface TrainingProgramDocument {
  id: string;
  trainingProgramId: string;
  documentName: string;
  documentType: string;
  fileUrl: string;
  uploadedAt: string;
}


// ==========================================
// UPLOAD TRAINING PROGRAM DOCUMENT
// ==========================================

export interface UploadTrainingProgramDocumentRequest {
  file: File;
  documentType: string;
}