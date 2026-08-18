export type AssessmentType =
  | "Written Exam"
  | "Practical Assessment";

export type ExamResultStatus =
  | "Passed"
  | "Failed"
  | "For Retake";

export type RetakeStatus =
  | "Not Allowed"
  | "Allowed"
  | "Used";

export type AnswerStatus =
  | "Correct"
  | "Incorrect";

export type TrainingOption = {
  name: string;
  code: string;
};

export type QuestionResult = {
  id: string;
  questionNumber: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  pointsEarned: number;
  maxPoints: number;
  status: AnswerStatus;
};

export type PracticalCriterionResult = {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  remarks: string;
};

export type ExamResult = {
  id: string;

  participantId: string;

  participantName: string;

  participantEmail: string;

  assessmentId: string;

  assessmentTitle: string;

  assessmentType: AssessmentType;

  training: string;

  trainingCode: string;

  attemptNumber: number;

  score: number;

  maxScore: number;

  percentage: number;

  passingScore: number;

  result: ExamResultStatus;

  submittedAt: string;

  retakeStatus: RetakeStatus;

  questions: QuestionResult[];

  practicalCriteria: PracticalCriterionResult[];

  trainerRemarks: string;
};