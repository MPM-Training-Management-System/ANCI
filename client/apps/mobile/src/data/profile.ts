export type CertificateStatus =
  | "Issued"
  | "Pending"
  | "Not Available";

export interface ParticipantProfile {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: string;
  status: string;
  memberSince: string;
  currentTraining: {
    id: string;
    title: string;
    trainer: string;
    progress: number;
    status: "Active" | "Completed" | "Pending";
  };
}

export interface ParticipantCertificate {
  id: string;
  certificateNumber: string;
  title: string;
  trainingTitle: string;
  issuedDate?: string;
  status: CertificateStatus;
  score?: number;
  description: string;
}

export const mockParticipantProfile: ParticipantProfile = {
  id: "720b97e0-2cea-49c1-b909-e45196725616",

  userCode: "PAR-000003",

  fullName: "Ralph Joed Nagal Gerente",

  email: "ralphjoedg@gmail.com",

  mobileNumber: "0917 123 4567",

  role: "Participant",

  status: "Active",

  memberSince: "August 2026",

  currentTraining: {
    id: "TRN-001",

    title: "Computer Systems Servicing NC II",

    trainer: "Juan Dela Cruz",

    progress: 72,

    status: "Active",
  },
};

export const mockCertificates: ParticipantCertificate[] = [
  {
    id: "CERT-001",

    certificateNumber: "CERT-2026-0001",

    title: "Certificate of Completion",

    trainingTitle:
      "Basic Computer Systems Servicing",

    issuedDate: "August 22, 2026",

    status: "Issued",

    score: 92,

    description:
      "Successfully completed the required training modules and assessments.",
  },

  {
    id: "CERT-002",

    certificateNumber: "CERT-2026-0002",

    title: "Certificate of Participation",

    trainingTitle:
      "Workplace Safety Fundamentals",

    issuedDate: "August 10, 2026",

    status: "Issued",

    score: 88,

    description:
      "Successfully participated in the required workplace safety training.",
  },

  {
    id: "CERT-003",

    certificateNumber: "CERT-2026-0003",

    title: "Certificate of Completion",

    trainingTitle:
      "Computer Systems Servicing NC II",

    status: "Pending",

    description:
      "Certificate will become available after completing the remaining training requirements.",
  },
];