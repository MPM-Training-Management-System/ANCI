export type AssessmentResult =
  | "Passed"
  | "Failed"
  | "Pending";

export type AssessmentStatus =
  | "Completed"
  | "Pending"
  | "Retake Scheduled"
  | "Retake Required";

export type Assessment = {
  id: string;

  participantId: string;
  participantName: string;

  training: string;
  batch: string;

  trainer: string;

  assessment: string;
  type: string;

  date: string;

  score: number | null;
  passingScore: number;

  result: AssessmentResult;
  status: AssessmentStatus;

  attempts: number;
  maxAttempts: number;

  retakeDate: string | null;
  retakeTime: string | null;
  retakeVenue: string | null;

  remarks: string;
};

export type AssessmentTableMeta = {
  onView?: (assessment: Assessment) => void;
  onManage?: (assessment: Assessment) => void;
};