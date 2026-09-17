export type UserRole =
  | "Admin"
  | "Participant"
  | "Trainer";

export type UserStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Suspended"
  | "Inactive"
  | "Active";


// =========================================================
// PARTICIPANT PROFILE
// =========================================================

export interface AdminParticipantProfile {
  id: string;

  firstName: string | null;
  middleName: string | null;
  lastName: string | null;

  birthDate: string | null;

  address: string | null;
  gender: string | null;

  profileImageUrl: string | null;
}


// =========================================================
// TRAINER PROFILE
// =========================================================

export interface AdminTrainerProfile {
  id: string;

  firstName: string | null;
  middleName: string | null;
  lastName: string | null;

  birthDate: string | null;

  address: string | null;
  gender: string | null;

  isActive: boolean;

  specialization: string;

  bio: string | null;

  yearsOfExperience: number | null;

  profileImageUrl: string | null;

  activatedAt: string | null;
}


// =========================================================
// USER LIST
// =========================================================

export interface AdminUserList {
  id: string;

  userCode: string;

  fullName: string;

  email: string;

  mobileNumber: string | null;

  role: UserRole;

  status: UserStatus;

  isEmailVerified: boolean;

  createdAt: string;

  updatedAt: string;

  profileImageUrl: string | null;
}


// =========================================================
// USER DETAILS
// =========================================================

export interface AdminUserDetails {
  id: string;

  userCode: string;

  fullName: string;

  email: string;

  mobileNumber: string | null;

  role: UserRole;

  status: UserStatus;

  isEmailVerified: boolean;

  createdAt: string;

  updatedAt: string;

  participantProfile: AdminParticipantProfile | null;

  trainerProfile: AdminTrainerProfile | null;
}


// =========================================================
// UPDATE USER
// =========================================================

export interface UpdateAdminUserRequest {
  fullName?: string | null;

  email?: string | null;

  mobileNumber?: string | null;

  firstName?: string | null;

  middleName?: string | null;

  lastName?: string | null;

  birthDate?: string | null;

  address?: string | null;

  gender?: string | null;

  // Trainer only

  specialization?: string | null;

  bio?: string | null;

  yearsOfExperience?: number | null;

  isActive?: boolean | null;
}


// =========================================================
// UPDATE STATUS
// =========================================================

export interface UpdateAdminUserStatusRequest {
  status: UserStatus;
}