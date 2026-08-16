// =====================================================
// APPLICATION STATUS
// =====================================================

export type UserApplicationStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

// =====================================================
// POLICY STATUS
// =====================================================

export type UserApplicationPolicyStatus =
  | "Pending"
  | "Passed"
  | "Failed";

// =====================================================
// USER APPLICATION RESPONSE
//
// Used for:
// - Pending Approvals
// - Dashboard
// - Lists
// =====================================================

export interface UserApplicationResponse {
  id: string;

  userId: string;

  userIdNumber: string;

  username: string;

  email: string;

  role: string;

  firstName: string;

  middleName?: string | null;

  lastName: string;

  fullName: string;

  profileImage?: string | null;

  status: UserApplicationStatus;

  policyStatus: UserApplicationPolicyStatus;

  policyRemarks?: string | null;

  submittedAt: string;

  isActive: boolean;

  isEmailVerified: boolean;
}

// =====================================================
// USER APPLICATION DETAILS
//
// Used when opening the modal
//
// BOTH:
// Participant
// Trainer
// =====================================================

export interface UserApplicationDetails {
  id: string;

  userId: string;

  userIdNumber: string;

  username: string;

  email: string;

  role: string;

  isActive: boolean;

  isEmailVerified: boolean;

  // ===================================================
  // APPLICATION
  // ===================================================

  status: UserApplicationStatus;

  policyStatus: UserApplicationPolicyStatus;

  policyRemarks?: string | null;

  reviewedBy?: string | null;

  reviewedAt?: string | null;

  rejectionReason?: string | null;

  submittedAt: string;

  // ===================================================
  // PERSONAL
  // ===================================================

  firstName: string;

  middleName?: string | null;

  lastName: string;

  fullName: string;

  dateOfBirth?: string | null;

  gender: string;

  civilStatus: string;

  mobileNumber: string;

  homeAddress: string;

  // ===================================================
  // PARTICIPANT
  // ===================================================

  emergencyContactName?: string | null;

  emergencyRelationship?: string | null;

  emergencyContactNumber?: string | null;

  // ===================================================
  // TRAINER
  // ===================================================

  expertise?: string | null;

  yearsOfExperience?: number | null;

  organization?: string | null;

  biography?: string | null;

  isProfileCompleted?: boolean;

  // ===================================================
  // DOCUMENTS
  // ===================================================

  profileImage?: string | null;

  validId?: string | null;

  // ===================================================
  // OPTIONAL
  // ===================================================

  createdAt?: string | null;
}


export interface RejectUserApplicationRequest {
  reason: string;
}