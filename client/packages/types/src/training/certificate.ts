export type CertificateType =
  | "Participation"
  | "Completion";

export interface Certificate {
  id: string;
  enrollmentId: string;

  certificateNumber: string;
  type: CertificateType;

  issuedAt: string;
  verificationCode: string;

  pdfUrl?: string | null;
  canvaDesignId?: string | null;

  isRevoked: boolean;
  revocationReason?: string | null;

  participantName?: string | null;
  trainingName?: string | null;
  batchCode?: string | null;
}


export interface EligibleCertificate {
  enrollmentId: string;
  trainingBatchId: string;

  participantName: string | null;
  trainingName: string | null;
  batchCode: string | null;

  overallGrade: number;
  isPassed: boolean;

  hasParticipationCertificate: boolean;
  hasCompletionCertificate: boolean;
}