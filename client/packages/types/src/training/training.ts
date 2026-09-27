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

// ==========================================
// TRAINING BATCH TRAINER
// ==========================================

export interface TrainingBatchTrainer {
  trainerProfileId: string;
  userId: string;
  fullName: string;
  userCode: string;
  email: string;
  profileImageUrl: string | null;
}

// ==========================================
// TRAINING BATCH
// ==========================================

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

// ==========================================
// TRAINING SCHEDULE STATUS
// ==========================================

export type TrainingScheduleStatus =
  | "Draft"
  | "Recommended"
  | "Approved";

// ==========================================
// TRAINING SESSION STATUS
// ==========================================

export type TrainingSessionStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled";

// ==========================================
// TRAINING SCHEDULE RECOMMENDATION
// ==========================================

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

// ==========================================
// GENERATE TRAINING SCHEDULE REQUEST
// ==========================================

export interface GenerateTrainingScheduleRequest {
  sessionsPerWeek: number;
  startTime: string;
  endTime: string;
  includeWeekends: boolean;
}

// ==========================================
// TRAINING SESSION
// ==========================================

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

// ==========================================
// LEARNING MATERIAL
// ==========================================

export interface LearningMaterial {
  id: string;
  trainingBatchId: string;
  batchCode: string;
  title: string;
  description: string | null;
  materialType: string;
  fileUrl: string;
  fileName: string | null;
  contentType: string | null;
  fileSize: number | null;

  // Original extracted document content
  extractedText: string | null;

  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// ==========================================
// CREATE LEARNING MATERIAL
// ==========================================

export interface CreateLearningMaterialRequest {
  trainingBatchId: string;
  title: string;
  description?: string | null;
  materialType: string;
}

// ==========================================
// UPDATE LEARNING MATERIAL
// ==========================================

export interface UpdateLearningMaterialRequest {
  title: string;
  description?: string | null;
  materialType: string;
}

// ==========================================
// UPLOAD LEARNING MATERIAL
// ==========================================

export interface UploadLearningMaterialRequest {
  file: File;
}

// ==========================================
// LEARNING MATERIAL EXTRACTION
// ==========================================

export interface LearningMaterialExtraction {
  learningMaterialId: string;
  fileName: string;
  contentType: string | null;
  text: string;
  characterCount: number;
  pageCount: number;
}
// ==========================================
// LEARNING MODULE
// ==========================================

export interface LearningModule {
  id: string;

  learningMaterialId: string;

  moduleNumber: number;

  title: string;

  description: string | null;

  // ==========================================
  // MODULE-SPECIFIC FILE
  // ==========================================

  fileUrl: string | null;

  fileName: string | null;

  contentType: string | null;

  fileSize: number | null;

  // Extracted text from the module-specific file
  extractedText: string | null;

  // ==========================================
  // AI-GENERATED SUPPORT CONTENT
  // ==========================================

  welcomeContent: string | null;

  learningObjectives: string[];

  summary: string | null;

  keyTakeaways: string[];

  // ==========================================
  // META
  // ==========================================

  displayOrder: number;

  createdAt: string;

  updatedAt: string | null;

  sectionCount: number;
}

// ==========================================
// CREATE LEARNING MODULE
// ==========================================

export interface CreateLearningModuleRequest {
  learningMaterialId: string;
  moduleNumber: number;
  title: string;
  description?: string | null;
  displayOrder: number;
}

// ==========================================
// UPDATE LEARNING MODULE
// ==========================================

export interface UpdateLearningModuleRequest {
  moduleNumber: number;
  title: string;
  description?: string | null;

  // AI-generated support content
  welcomeContent?: string | null;
  learningObjectives?: string[];
  summary?: string | null;
  keyTakeaways?: string[];

  displayOrder: number;
}

// ==========================================
// UPLOAD LEARNING MODULE FILE
// ==========================================

export interface UploadLearningModuleRequest {
  file: File;
}

// ==========================================
// LEARNING MODULE EXTRACTION
// ==========================================

export interface LearningModuleExtraction {
  learningModuleId: string;

  fileName: string | null;

  contentType: string | null;

  text: string;

  characterCount: number;

  pageCount: number;
}

// ==========================================
// LEARNING SECTION
// ==========================================

export interface LearningSection {
  id: string;
  learningModuleId: string;
  sectionNumber: number;
  title: string;
  contentType: string;
  content: string | null;
  mediaUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

// ==========================================
// CREATE LEARNING SECTION
// ==========================================

export interface CreateLearningSectionRequest {
  learningModuleId: string;
  sectionNumber: number;
  title: string;
  contentType: string;
  content?: string | null;
  mediaUrl?: string | null;
  displayOrder: number;
}

// ==========================================
// UPDATE LEARNING SECTION
// ==========================================

export interface UpdateLearningSectionRequest {
  sectionNumber: number;
  title: string;
  contentType: string;
  content?: string | null;
  mediaUrl?: string | null;
  displayOrder: number;
}