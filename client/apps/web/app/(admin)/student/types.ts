export type ParticipantStatus =
  | "Active"
  | "Completed"
  | "Dropped";

export type AssessmentStatus =
  | "Passed"
  | "Pending"
  | "Failed"
  | "Not Started";

export type CompletionStatus =
  | "In Progress"
  | "Completed"
  | "Eligible"
  | "Dropped";

export type Participant = {
  id: string;

  participantId: string;

  name: string;

  email: string;

  mobile: string;

  training: string;

  trainingCode: string;

  enrollmentDate: string;

  status: ParticipantStatus;

  attendance: number;

  assessment: AssessmentStatus;

  completion: CompletionStatus;

  completedModules: number;

  totalModules: number;

  address: string;

  emergencyContact: string;

  emergencyNumber: string;
};