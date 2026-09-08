// ============================================================
// WRITTEN ASSESSMENT
// ============================================================

export type AssessmentAttemptStatus =
  | "InProgress"
  | "Submitted"
  | "Passed"
  | "Failed";

export interface WrittenAssessment {
  id: string;
  trainingBatchId: string;
  batchCode: string;
  title: string;
  description?: string | null;
  passingPercentage: number;
  isPublished: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

// ============================================================
// CREATE / UPDATE ASSESSMENT
// ============================================================

export interface CreateWrittenAssessmentRequest {
  trainingBatchId: string;
  title: string;
  description?: string | null;
  passingPercentage: number;
}

export interface UpdateWrittenAssessmentRequest {
  title: string;
  description?: string | null;
  passingPercentage: number;
}

// ============================================================
// QUESTIONS
// ============================================================

export interface AssessmentQuestion {
  id: string;
  writtenAssessmentId: string;
  questionNumber: number;
  questionText: string;
  points: number;
  choices: AssessmentChoice[];
}

export interface AdminAssessmentQuestion {
  id: string;
  writtenAssessmentId: string;
  questionNumber: number;
  questionText: string;
  points: number;
  choices: AdminAssessmentChoice[];
}

export interface CreateAssessmentQuestionRequest {
  writtenAssessmentId: string;
  questionNumber: number;
  questionText: string;
  points: number;
}

export interface UpdateAssessmentQuestionRequest {
  questionNumber: number;
  questionText: string;
  points: number;
}

// ============================================================
// CHOICES
// ============================================================

export interface AssessmentChoice {
  id: string;
  assessmentQuestionId: string;
  choiceLabel: string;
  choiceText: string;
  displayOrder: number;
}

export interface AdminAssessmentChoice {
  id: string;
  assessmentQuestionId: string;
  choiceLabel: string;
  choiceText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface CreateAssessmentChoiceRequest {
  assessmentQuestionId: string;
  choiceLabel: string;
  choiceText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface UpdateAssessmentChoiceRequest {
  choiceLabel: string;
  choiceText: string;
  isCorrect: boolean;
  displayOrder: number;
}

// ============================================================
// PARTICIPANT
// ============================================================

export interface ParticipantAssessment {
  id: string;
  trainingBatchId: string;
  batchCode: string;
  title: string;
  description?: string | null;
  passingPercentage: number;
  questionCount: number;
  isPublished: boolean;
  attemptCount: number;
  hasPassed: boolean;
  latestPercentage?: number | null;
}

// ============================================================
// START ATTEMPT
// ============================================================

export interface StartAssessmentRequest {
  writtenAssessmentId: string;
}

// ============================================================
// ATTEMPT
// ============================================================

export interface AssessmentAttempt {
  id: string;
  writtenAssessmentId: string;
  assessmentTitle: string;
  attemptNumber: number;
  startedAt: string;
  status: AssessmentAttemptStatus;
  questions: AssessmentQuestion[];
}

// ============================================================
// SUBMIT
// ============================================================

export interface SubmitAssessmentRequest {
  attemptId: string;
  answers: SubmitAssessmentAnswerRequest[];
}

export interface SubmitAssessmentAnswerRequest {
  questionId: string;
  selectedChoiceId?: string | null;
}

// ============================================================
// RESULT
// ============================================================

export interface AssessmentResult {
  id: string;
  assessmentAttemptId: string;
  writtenAssessmentId: string;
  assessmentTitle: string;
  attemptNumber: number;
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  isPassed: boolean;
  evaluatedAt: string;
}