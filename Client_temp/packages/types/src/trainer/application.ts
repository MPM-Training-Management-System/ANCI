export type TrainerApplicationStatus =
  | "Pending"
  | "UnderReview"
  | "NeedsCorrection"
  | "Approved"
  | "Rejected";

  export type TrainerApplicationDocumentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "NeedsCorrection";

export interface TrainerApplicationDocument {
  id: string;

  trainerApplicationId: string;

  documentType: string;

  fileName: string;

  fileUrl: string;

  status: TrainerApplicationDocumentStatus;

  reviewRemarks?: string | null;

  reviewedByUserId?: string | null;

  reviewedAt?: string | null;

  uploadedAt: string;
}



export interface TrainerApplication {
  id: string;

  userId: string;

  userCode: string;

  fullName: string;

  email: string;
  bio?: string;
  mobileNumber: string | null;

  specialization: string;

  yearsOfExperience: number;

  certificationName: string | null;

  certificationNumber: string | null;

  profileImageUrl: string | null;

  status: string;

  adminRemarks: string | null;

  createdAt: string;

  submittedAt: string | null;

  documents: TrainerApplicationDocument[];
}




export interface ReviewTrainerApplicationRequest {
  decision:
    | "Approved"
    | "Rejected"
    | "NeedsCorrection";

  remarks?: string | null;
}


// =========================================================
// REVIEW DOCUMENT
// =========================================================

export interface ReviewTrainerApplicationDocumentRequest {
  decision:
    | "Approved"
    | "Rejected"
    | "NeedsCorrection";

  remarks?: string | null;
}


// =========================================================
// UPDATE APPLICATION
// =========================================================

export interface UpdateTrainerApplicationRequest {
  specialization: string;

  yearsOfExperience?: number;

  certificationName?: string;

  certificationNumber?: string;
}


// =========================================================
// UPDATE TRAINER PROFILE
// =========================================================

export interface UpdateTrainerProfileRequest {
  specialization: string;

  bio?: string;

  yearsOfExperience?: number;

  mobileNumber?: string;
}