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

  // Personal Information
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  birthDate: string | null;
  address: string | null;
  gender: string | null;
  profileImageUrl: string | null;

  // Educational Background
  highestEducationalAttainment: string | null;
  educationalStatus: string | null;
  schoolName: string | null;
  courseOrDegree: string | null;
  fieldOfStudy: string | null;
  yearGraduated: number | null;

  // Employment Information
  employmentStatus: string | null;
  companyName: string | null;
  jobTitle: string | null;
  industry: string | null;
  yearsOfWorkExperience: number | null;

  // Valid ID Information
  validIdType: string | null;
  validIdNumber: string | null;
  validIdImageUrl: string | null;
  validIdVerificationStatus: string | null;
  validIdRemarks: string | null;
  validIdVerifiedAt: string | null;
  validIdVerifiedBy: string | null;

  // Emergency Contact
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  emergencyContactRelationship: string | null;
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
  // Account Information
  fullName?: string | null;
  email?: string | null;
  mobileNumber?: string | null;

  // Personal Information
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  birthDate?: string | null;
  address?: string | null;
  gender?: string | null;

  // Educational Background
  highestEducationalAttainment?: string | null;
  educationalStatus?: string | null;
  schoolName?: string | null;
  courseOrDegree?: string | null;
  fieldOfStudy?: string | null;
  yearGraduated?: number | null;

  // Employment Information
  employmentStatus?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  industry?: string | null;
  yearsOfWorkExperience?: number | null;

  // Emergency Contact
  emergencyContactName?: string | null;
  emergencyContactNumber?: string | null;
  emergencyContactRelationship?: string | null;

  // Trainer Information
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