export type EnrollmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Completed";

export interface ParticipantEnrollment {
  id: string;
  trainingId: string;
  trainingCode: string;
  trainingTitle: string;

  participantName: string;
  email: string;
  mobileNumber: string;

  trainer: string;

  mode: "Online" | "Face-to-Face" | "Hybrid";

  schedule: string;
  time: string;
  location: string;
  duration: string;

  submittedAt: string;

  status: EnrollmentStatus;

  reviewedAt?: string;
  rejectionReason?: string;

  startDate: string;
  endDate: string;
}

export const mockParticipantEnrollments: ParticipantEnrollment[] = [
  {
    id: "ENR-001",

    trainingId: "TRN-001",

    trainingCode: "TRN-WEB-001",

    trainingTitle:
      "Web Development Fundamentals",

    participantName:
      "Ralph Joed Nagal Gerente",

    email:
      "ralphjoedg@gmail.com",

    mobileNumber:
      "09123456789",

    trainer:
      "Juan Dela Cruz",

    mode: "Hybrid",

    schedule:
      "Monday & Wednesday",

    time:
      "9:00 AM – 12:00 PM",

    location:
      "ANCE Training Center",

    duration:
      "3 Months",

    submittedAt:
      "August 23, 2026",

    status:
      "Pending",

    startDate:
      "September 1, 2026",

    endDate:
      "November 30, 2026",
  },
];