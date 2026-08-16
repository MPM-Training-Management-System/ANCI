export type ApplicationStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export type PolicyStatus =
  | "Pending"
  | "Passed"
  | "Failed";

  
export interface ParticipantApplicationDetails {

  id: string;
  userId: string;
  status: ApplicationStatus;
  policyStatus: PolicyStatus;
  policyRemarks?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  submittedAt: string;
  userIdNumber: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  civilStatus: string;
  mobileNumber: string;
  homeAddress: string;
  emergencyContactName?: string | null;
  emergencyRelationship?: string | null;
  emergencyContactNumber?: string | null;
  profileImage?: string | null;
  validId?: string | null;
}
export interface ParticipantApplication {
  id: string;
  userId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;

  email: string;
  username?: string | null;
  profileImage?: string | null;

  status: ApplicationStatus;

  policyStatus: PolicyStatus;
  policyRemarks?: string | null;

  reviewedBy?: string | null;
  reviewedAt?: string | null;

  rejectionReason?: string | null;

  submittedAt: string;
}

export interface RejectApplicationRequest {
  reason: string;
}



export interface TrainerApplicationDetails {

  id: string;
  userId: string;
  status: ApplicationStatus;
  policyStatus: PolicyStatus;
  policyRemarks?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  submittedAt: string;
  userIdNumber: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  civilStatus: string;
  mobileNumber: string;
  homeAddress: string;
  emergencyContactName?: string | null;
  emergencyRelationship?: string | null;
  emergencyContactNumber?: string | null;
  profileImage?: string | null;
  validId?: string | null;
}