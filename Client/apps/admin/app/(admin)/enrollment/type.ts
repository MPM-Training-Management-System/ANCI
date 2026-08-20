export type EnrollmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Waitlisted";

export type Enrollment = {
  id: string;
  participantId: string;
  participantName: string;
  email: string;
  phone: string;
  training: string;
  batch: string;
  schedule: string;
  trainer: string;
  appliedDate: string;
  status: EnrollmentStatus;
  requirements: number;
  totalRequirements: number;
  remarks: string;
};